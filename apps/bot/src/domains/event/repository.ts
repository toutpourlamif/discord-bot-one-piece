import { db, eventInstance } from '@one-piece/db';
import { eq } from 'drizzle-orm';

export async function updateState(id: number, state: Record<string, unknown>): Promise<void> {
  await db
    .update(eventInstance)
    .set({ state })
    .where(eq(eventInstance.id, BigInt(id)));
}
