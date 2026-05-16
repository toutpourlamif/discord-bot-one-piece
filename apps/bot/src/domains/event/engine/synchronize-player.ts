import { db } from '@one-piece/db';

import * as playerRepository from '../../player/repository.js';
import { interactiveGenerators, passiveGenerators } from '../generators/registry.js';
import * as eventRepository from '../repository.js';
import type { InteractiveGenerator } from '../types.js';

import { getLatestProcessableBucket } from './bucket.js';
import { clampToReplayWindow } from './clamp-replay-window.js';
import { buildGeneratorContext, fetchGeneratorContextData } from './context-builders.js';
import { evaluateGeneratorHappening } from './evaluate-generator-happening.js';
import { recordInteractive, recordPassive } from './record-event.js';
import { pickRandomWithSeed, seedFromBucketAndPlayer } from './rng.js';
import { tryCompleteTravel } from './try-complete-travel.js';

export type SyncResult =
  | { status: 'already_caught_up' }
  | { status: 'caught_up'; generatedPassiveCount: number }
  | { status: 'blocked_on_interactive'; generatedPassiveCount: number; interactiveKey: string };

/**
 * Rejoue les buckets en attente du joueur (depuis `lastProcessedBucketId`, jusqu'à `lastProcessableBucketId`) :
 * applique les passives au fur et à mesure, et s'arrête au premier interactif tiré. Le tout en une transaction.
 */
export async function synchronizePlayer(playerId: number): Promise<SyncResult> {
  return db.transaction(async (tx) => {
    const player = await playerRepository.findByIdOrThrow(playerId, tx, { forUpdate: true });

    const interactivePending = await eventRepository.findFirstInteractivePending(playerId, tx);
    if (interactivePending) {
      return { status: 'blocked_on_interactive', generatedPassiveCount: 0, interactiveKey: interactivePending.eventKey };
    }

    const latestProcessableBucket = getLatestProcessableBucket();
    let fromBucket = player.lastProcessedBucketId + 1;
    if (fromBucket > latestProcessableBucket) {
      return { status: 'already_caught_up' };
    }
    fromBucket = clampToReplayWindow(fromBucket, latestProcessableBucket);

    const ctxData = await fetchGeneratorContextData(player, tx);
    let generatedPassiveCount = 0;

    for (let bucketId = fromBucket; bucketId <= latestProcessableBucket; bucketId++) {
      const ctx = buildGeneratorContext(ctxData, bucketId);

      await tryCompleteTravel({ ctx, ctxData, tx });

      for (const gen of passiveGenerators) {
        const rng = evaluateGeneratorHappening(gen, ctx);
        if (!rng) continue;

        await recordPassive(gen, ctx, ctxData, rng, tx);
        generatedPassiveCount++;
      }

      const candidates: Array<InteractiveGenerator> = [];
      for (const gen of interactiveGenerators) {
        if (evaluateGeneratorHappening(gen, ctx)) candidates.push(gen);
      }

      if (candidates.length > 0) {
        const picked = pickRandomWithSeed(seedFromBucketAndPlayer(bucketId, playerId), candidates);

        await recordInteractive(picked, ctx, tx);
        await playerRepository.setLastProcessedBucketId(playerId, bucketId, tx);
        return { status: 'blocked_on_interactive', generatedPassiveCount, interactiveKey: picked.key };
      }
    }

    await playerRepository.setLastProcessedBucketId(playerId, latestProcessableBucket, tx);
    return { status: 'caught_up', generatedPassiveCount };
  });
}
