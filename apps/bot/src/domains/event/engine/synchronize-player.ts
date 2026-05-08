import { db } from '@one-piece/db';

import * as characterRepository from '../../character/repository.js';
import { isInCrewFilter } from '../../crew/utils/is-in-crew-filter.js';
import * as historyRepository from '../../history/index.js';
import * as playerRepository from '../../player/repository.js';
import * as resourceRepository from '../../resource/repository.js';
import * as shipRepository from '../../ship/repository.js';
import { applyEffects } from '../effects/apply-effects.js';
import { interactiveGenerators, passiveGenerators } from '../generators/registry.js';
import * as eventRepository from '../repository.js';
import type { GeneratorContext, InteractiveGenerator } from '../types.js';

import { getLatestProcessableBucket } from './bucket.js';
import { clampToReplayWindow } from './clamp-replay-window.js';
import { buildCrewAccessor, buildHistoryAccessor, type HistoryRow } from './context-builders.js';
import { evaluateGeneratorHappening } from './evaluate-generator-happening.js';
import { pickRandomWithSeed, seedFromBucketAndPlayer } from './rng.js';

export type SyncResult =
  | { kind: 'already_caught_up' }
  | { kind: 'caught_up'; generatedPassiveCount: number }
  | { kind: 'blocked_on_interactive'; generatedPassiveCount: number; interactiveKey: string };

export async function synchronizePlayer(playerId: number): Promise<SyncResult> {
  return db.transaction(async (tx) => {
    const player = await playerRepository.findByIdOrThrow(playerId, tx, { forUpdate: true });

    const interactivePending = await eventRepository.findFirstInteractivePending(playerId, tx);
    if (interactivePending) {
      return { kind: 'blocked_on_interactive', generatedPassiveCount: 0, interactiveKey: interactivePending.eventKey };
    }

    const latestProcessableBucket = getLatestProcessableBucket();
    let fromBucket = player.lastProcessedBucketId + 1;
    if (fromBucket > latestProcessableBucket) {
      return { kind: 'already_caught_up' };
    }
    fromBucket = clampToReplayWindow(fromBucket, latestProcessableBucket);

    const ship = await shipRepository.findByPlayerIdOrThrow(playerId, tx);
    const inventory = await resourceRepository.getInventory(playerId, tx);
    const allCharacters = await characterRepository.getCharactersByPlayerId(playerId, tx);
    const historyLogsLoaded = await historyRepository.loadAllForPlayer(playerId, tx);

    const crew = buildCrewAccessor(allCharacters.filter(isInCrewFilter));
    const historyLogs: Array<HistoryRow> = [...historyLogsLoaded];

    let generatedPassiveCount = 0;
    let currentBucket = fromBucket;
    const history = buildHistoryAccessor(historyLogs, () => currentBucket);

    for (let bucketId = fromBucket; bucketId <= latestProcessableBucket; bucketId++) {
      currentBucket = bucketId;

      const ctx: GeneratorContext = {
        player,
        crew,
        ship,
        inventory,
        history,
        bucketId,
        // TODO: navigation — quand la zone pourra changer en cours de replay (générateur `travel.arrival`
        // qui émet un effect `changeZone`, ou interactif "Partir" qui passe par applyEffects), la mutation
        // in-place de ctx.player.currentZone par applyEffects suffira. En attendant, la zone est constante.
        zone: player.currentZone,
        // TODO: cross-player v2 — remplir avec les autres joueurs présents dans la zone à ce bucket
        othersInZone: [],
      };

      for (const gen of passiveGenerators) {
        const rng = evaluateGeneratorHappening(gen, ctx, playerId);
        if (!rng) continue;

        const { effects, state } = gen.compute(ctx, rng);

        await applyEffects(effects, ctx, tx);
        await eventRepository.insertWithIdempotence({ playerId, eventKey: gen.key, isInteractive: false, bucketId, state }, tx);
        await historyRepository.writeEventResolution({ actorPlayerId: playerId, eventType: gen.key, bucketId }, tx);

        generatedPassiveCount++;
        // Mutation in-place : les buckets suivants doivent voir les events qu'on vient de générer (cooldown / oneTime / has).
        historyLogs.push({ eventType: gen.key, bucketId });
      }

      const candidates: Array<InteractiveGenerator> = [];
      for (const gen of interactiveGenerators) {
        if (evaluateGeneratorHappening(gen, ctx, playerId)) candidates.push(gen);
      }

      if (candidates.length > 0) {
        const picked = pickRandomWithSeed(seedFromBucketAndPlayer(bucketId, playerId), candidates);

        await eventRepository.insertWithIdempotence(
          { playerId, eventKey: picked.key, isInteractive: true, bucketId, state: { step: picked.initial } },
          tx,
        );
        await playerRepository.setLastProcessedBucketId(playerId, bucketId, tx);
        return { kind: 'blocked_on_interactive', generatedPassiveCount, interactiveKey: picked.key };
      }
    }

    await playerRepository.setLastProcessedBucketId(playerId, latestProcessableBucket, tx);
    return { kind: 'caught_up', generatedPassiveCount };
  });
}
