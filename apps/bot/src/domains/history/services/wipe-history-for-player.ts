import { db, type DbOrTransaction } from '@one-piece/db';

import { findGeneratorByHistoryKindOrThrow } from '../../event/generators/registry.js';
import * as eventRepository from '../../event/repository.js';
import * as historyRepository from '../repository/index.js';

export type WipeHistoryMode = 'last' | 'all';

type WipeHistoryForPlayerArgs = {
  targetPlayerId: number;
  actorPlayerId: number;
  kind?: string;
  mode: WipeHistoryMode;
};

export type WipeHistoryForPlayerResult = {
  wipedHistoryCount: number;
  remainingPendingEventCount: number;
};

export async function wipeHistoryForPlayer({
  targetPlayerId,
  actorPlayerId,
  kind,
  mode,
}: WipeHistoryForPlayerArgs): Promise<WipeHistoryForPlayerResult> {
  // `kind` peut être dotté (`seagullFlyby.outcomeX`) ; pour compter les pending events
  // on a besoin de la clé du générateur (`seagullFlyby`), pas du suffixe.
  const eventKey = kind ? findGeneratorByHistoryKindOrThrow(kind).key : undefined;

  return db.transaction(async (tx) => {
    const wipedHistoryCount = await wipeRows({ targetPlayerId, kind, mode }, tx);
    const remainingPendingEventCount = await eventRepository.countPendingEventsForPlayer(targetPlayerId, {
      eventKey,
      client: tx,
    });

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

type WipeRowsArgs = {
  targetPlayerId: number;
  kind?: string;
  mode: WipeHistoryMode;
};

async function wipeRows({ targetPlayerId, kind, mode }: WipeRowsArgs, tx: DbOrTransaction): Promise<number> {
  if (mode === 'all') {
    return historyRepository.deleteForPlayer(targetPlayerId, { kind, client: tx });
  }

  const lastId = await historyRepository.findLastIdForPlayer(targetPlayerId, { kind, client: tx });
  if (lastId === null) return 0;
  return historyRepository.deleteById(lastId, tx);
}
