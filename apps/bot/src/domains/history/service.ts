import { db } from '@one-piece/db';

import * as historyRepository from './repository.js';

export async function wipeHistoryForPlayer(playerId: number): Promise<number> {
  return db.transaction(async (tx) => {
    const count = await historyRepository.wipeHistoryForPlayer(playerId, tx);

    await historyRepository.appendHistory({
      type: 'dev.history_reset',
      actorPlayerId: undefined,
      target: { type: 'player', id: playerId },
      payload: { wipedCount: count },
      client: tx,
    });

    return count;
  });
}
