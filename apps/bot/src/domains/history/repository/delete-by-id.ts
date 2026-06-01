import { db, history, type DbOrTransaction } from '@one-piece/db';
import { eq } from 'drizzle-orm';

export async function deleteById(id: bigint, client: DbOrTransaction = db): Promise<number> {
  const rows = await client.delete(history).where(eq(history.id, id)).returning({ id: history.id });
  return rows.length;
}
