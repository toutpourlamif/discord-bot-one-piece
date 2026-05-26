import { db, history, type DbOrTransaction } from '@one-piece/db';
import { and, desc, eq, sql } from 'drizzle-orm';

import type { HistoryEntryId } from './types.js';

export async function findLastForPlayerByKindPrefix(
  playerId: number,
  kind: string,
  kindPrefixPattern: string,
  client: DbOrTransaction = db,
): Promise<HistoryEntryId | null> {
  const [row] = await client
    .select({ id: history.id })
    .from(history)
    .where(
      and(eq(history.actorPlayerId, playerId), sql`(${history.kind} = ${kind} OR ${history.kind} LIKE ${kindPrefixPattern} ESCAPE '\\')`),
    )
    .orderBy(desc(history.occurredAt), desc(history.id))
    .limit(1);

  return row ?? null;
}
