import { db, history, type DbOrTransaction } from '@one-piece/db';
import { desc, eq } from 'drizzle-orm';

import type { HistoryEntryId } from './types.js';

export async function findLastForPlayer(playerId: number, client: DbOrTransaction = db): Promise<HistoryEntryId | null> {
  const [row] = await client
    .select({ id: history.id })
    .from(history)
    .where(eq(history.actorPlayerId, playerId))
    .orderBy(desc(history.occurredAt), desc(history.id))
    .limit(1);

  return row ?? null;
}
