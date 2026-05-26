import { db, type DbOrTransaction } from '@one-piece/db';

import * as eventRepository from '../event/repository.js';

import * as historyRepository from './repository.js';

export type WipeHistoryMode = 'last' | 'all';

type WipeHistoryForPlayerArgs = {
  targetPlayerId: number;
  actorPlayerId: number;
  kind?: string;
  mode: WipeHistoryMode;
};

type WipeHistoryForPlayerResult = {
  wipedHistoryCount: number;
  remainingPendingEventCount: number;
};

export async function wipeHistoryForPlayer({
  targetPlayerId,
  actorPlayerId,
  kind,
  mode,
}: WipeHistoryForPlayerArgs): Promise<WipeHistoryForPlayerResult> {
  return db.transaction(async (tx) => {
    const wipedHistoryCount = await wipeHistoryRows({ targetPlayerId, kind, mode }, tx);
    const remainingPendingEventCount = kind
      ? await eventRepository.countPendingEventsForPlayerByEventKey(targetPlayerId, kind, tx)
      : await eventRepository.countPendingEventsForPlayer(targetPlayerId, tx);

    await historyRepository.appendHistory({
      type: 'dev.historyReset',
      actorPlayerId,
      target: { type: 'player', id: targetPlayerId },
      payload: { wipedCount: wipedHistoryCount, remainingPendingEventCount, kind, mode },
      client: tx,
    });

    return { wipedHistoryCount, remainingPendingEventCount };
  });
}

type WipeHistoryRowsArgs = {
  targetPlayerId: number;
  kind?: string;
  mode: WipeHistoryMode;
};

async function wipeHistoryRows({ targetPlayerId, kind, mode }: WipeHistoryRowsArgs, tx: DbOrTransaction): Promise<number> {
  if (mode === 'all') {
    if (!kind) return historyRepository.deleteAllForPlayer(targetPlayerId, tx);
    return historyRepository.deleteAllForPlayerByKindPrefix(targetPlayerId, kind, buildKindPrefixPattern(kind), tx);
  }

  const lastEntry = kind
    ? await historyRepository.findLastForPlayerByKindPrefix(targetPlayerId, kind, buildKindPrefixPattern(kind), tx)
    : await historyRepository.findLastForPlayer(targetPlayerId, tx);
  if (!lastEntry) return 0;

  return historyRepository.deleteById(lastEntry.id, tx);
}

function buildKindPrefixPattern(kind: string): string {
  return `${escapeLikePattern(kind)}.%`;
}

function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&');
}
