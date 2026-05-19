import { db } from '@one-piece/db';

import * as historyRepository from './repository.js';

type WipeHistoryForPlayerArgs = {
  targetPlayerId: number;
  actorPlayerId: number;
};

export async function wipeHistoryForPlayer({ targetPlayerId, actorPlayerId }: WipeHistoryForPlayerArgs): Promise<number> {
  return db.transaction(async (tx) => {
    const count = await historyRepository.wipeHistoryForPlayer(targetPlayerId, tx);

    await historyRepository.appendHistory({
      type: 'dev.historyReset',
      actorPlayerId,
      target: { type: 'player', id: targetPlayerId },
      payload: { wipedCount: count },
      client: tx,
    });

    return count;
  });
}
