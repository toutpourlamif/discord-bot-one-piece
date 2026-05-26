import { db, history, type DbOrTransaction } from '@one-piece/db';
import { eq } from 'drizzle-orm';

export async function deleteAllForPlayer(playerId: number, client: DbOrTransaction = db): Promise<number> {
  const rows = await client.delete(history).where(eq(history.actorPlayerId, playerId)).returning({ id: history.id });
  return rows.length;
}
