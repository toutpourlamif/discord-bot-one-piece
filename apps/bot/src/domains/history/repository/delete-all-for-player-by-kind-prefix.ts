import { db, history, type DbOrTransaction } from '@one-piece/db';
import { and, eq, sql } from 'drizzle-orm';

export async function deleteAllForPlayerByKindPrefix(
  playerId: number,
  kind: string,
  kindPrefixPattern: string,
  client: DbOrTransaction = db,
): Promise<number> {
  const rows = await client
    .delete(history)
    .where(
      and(eq(history.actorPlayerId, playerId), sql`(${history.kind} = ${kind} OR ${history.kind} LIKE ${kindPrefixPattern} ESCAPE '\\')`),
    )
    .returning({ id: history.id });
  return rows.length;
}
