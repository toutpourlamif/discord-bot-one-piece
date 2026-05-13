import type { Player, Ship, Transaction } from '@one-piece/db';

import * as characterRepository from '../../character/repository.js';
import type { CharacterRow } from '../../character/types.js';
import { isInCrewFilter } from '../../crew/utils/is-in-crew-filter.js';
import * as historyRepository from '../../history/index.js';
import type { HistoryLog } from '../../history/repository.js';
import * as resourceRepository from '../../resource/repository.js';
import type { Inventory } from '../../resource/types.js';
import * as shipRepository from '../../ship/repository.js';
import type { GeneratorContext } from '../types.js';

// TODO: renommer le champ `eventType` → `kind` quand history.event_type sera renommé (cf packages/db/src/domains/history/schema.ts)
type HistoryRow = Pick<HistoryLog, 'eventType' | 'bucketId'>;

export type GeneratorContextData = {
  player: Player;
  ship: Ship;
  inventory: Inventory;
  characters: Array<CharacterRow>;
  historyLogs: Array<HistoryRow>;
};

export async function fetchGeneratorContextData(player: Player, tx: Transaction): Promise<GeneratorContextData> {
  const ship = await shipRepository.findByPlayerIdOrThrow(player.id, tx);
  const inventory = await resourceRepository.getInventory(player.id, tx);
  const characters = await characterRepository.getCharactersByPlayerId(player.id, tx);
  const historyLogsLoaded = await historyRepository.loadAllForPlayer(player.id, tx);
  return { player, ship, inventory, characters, historyLogs: [...historyLogsLoaded] };
}

export function buildGeneratorContext(ctxData: GeneratorContextData, bucketId: number): GeneratorContext {
  return {
    player: ctxData.player,
    crew: buildCrewAccessor(ctxData.characters.filter(isInCrewFilter)),
    ship: ctxData.ship,
    inventory: ctxData.inventory,
    history: buildHistoryAccessor(ctxData.historyLogs, bucketId),
    bucketId,
    // TODO: navigation — quand la zone pourra changer en cours de replay (générateur `travel.arrival`
    // qui émet un effect `changeZone`, ou interactif "Partir" qui passe par applyEffects), la mutation
    // in-place de ctx.player.currentZone par applyEffects suffira. En attendant, la zone est constante.
    zone: ctxData.player.currentZone,
    // TODO: cross-player v2 — remplir avec les autres joueurs présents dans la zone à ce bucket
    othersInZone: [],
  };
}

function buildCrewAccessor(members: Array<CharacterRow>): GeneratorContext['crew'] {
  function find(name: string): CharacterRow | undefined {
    return members.find((m) => m.name === name || m.nickname === name);
  }
  return {
    members,
    has: (name) => find(name) !== undefined,
    getByName: (name) => find(name),
  };
}

function buildHistoryAccessor(historyLogs: Array<HistoryRow>, currentBucketId: number): GeneratorContext['history'] {
  return {
    has: (type) => historyLogs.some((log) => log.eventType === type),
    lastResolutionOf: (prefix) => historyLogs.findLast((log) => log.eventType.startsWith(prefix))?.eventType,
    countSinceNBuckets: (type, nBuckets) => {
      const minBucket = currentBucketId - nBuckets;
      return historyLogs.filter((log) => log.eventType === type && log.bucketId !== null && log.bucketId > minBucket).length;
    },
  };
}
