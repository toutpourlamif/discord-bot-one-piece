import { db, history, type DbOrTransaction } from '@one-piece/db';
import { asc, eq } from 'drizzle-orm';

import type { HistoryLog } from './types.js';

export async function loadAllForPlayer(playerId: number, client: DbOrTransaction = db): Promise<Array<HistoryLog>> {
  return client
    .select({
      kind: history.kind,
      occurredAt: history.occurredAt,
      bucketId: history.bucketId,
      payload: history.payload,
    })
    .from(history)
    .where(eq(history.actorPlayerId, playerId))
    .orderBy(asc(history.occurredAt));
}
