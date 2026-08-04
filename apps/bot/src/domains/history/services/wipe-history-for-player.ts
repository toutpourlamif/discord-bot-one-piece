import { db, type DbOrTransaction } from '@one-piece/db';

import { findGeneratorByHistoryKindOrThrow } from '../../event/generators/registry.js';
import * as eventRepository from '../../event/repository.js';
import * as historyRepository from '../repository/index.js';

export type WipeHistoryMode = 'last' | 'all';

type WipeHistoryForPlayerArgs = {
  targetPlayerId: number;
  actorPlayerId: number;
  type?: string;
  mode: WipeHistoryMode;
};

export type WipeHistoryForPlayerResult = {
  wipedHistoryCount: number;
  remainingPendingEventCount: number;
};

export async function wipeHistoryForPlayer({
  targetPlayerId,
  actorPlayerId,
  type,
  mode,
}: WipeHistoryForPlayerArgs): Promise<WipeHistoryForPlayerResult> {
  // `type` peut être dotté (`seagullFlyby.outcomeX`) ; pour compter les pending events
  // on a besoin de la clé du générateur (`seagullFlyby`), pas du suffixe.
  const eventKey = type ? findGeneratorByHistoryKindOrThrow(type).key : undefined;

  return db.transaction(async (tx) => {
    const wipedHistoryCount = await wipeRows({ targetPlayerId, type, mode }, tx);
    const remainingPendingEventCount = await eventRepository.countPendingEventsForPlayer(targetPlayerId, {
      eventKey,
      client: tx,
    });

    await historyRepository.appendHistory({
      type: 'dev.historyReset',
      actorPlayerId,
      target: { type: 'player', id: targetPlayerId },
      payload: { wipedCount: wipedHistoryCount, remainingPendingEventCount, wipedType: type, mode },
      client: tx,
    });

    return { wipedHistoryCount, remainingPendingEventCount };
  });
}

type WipeRowsArgs = {
  targetPlayerId: number;
  type?: string;
  mode: WipeHistoryMode;
};

async function wipeRows({ targetPlayerId, type, mode }: WipeRowsArgs, tx: DbOrTransaction): Promise<number> {
  if (mode === 'all') {
    return historyRepository.deleteForPlayer(targetPlayerId, { type, client: tx });
  }

  const last = await historyRepository.findLastForPlayer(targetPlayerId, { type, client: tx });
  if (last === null) return 0;
  return historyRepository.deleteById(last.id, tx);
}
