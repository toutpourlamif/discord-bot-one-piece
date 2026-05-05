import { db, eventInstance } from '@one-piece/db';
import { eq } from 'drizzle-orm';

export type PendingEventInstance = {
  id: number;
  type: string;
  scope: 'passive' | 'interactive';
  bucketId: number;
  encounterId: number | null;
  state: Record<string, unknown>;
  createdAt: Date;
};

export async function updateState(id: number, state: Record<string, unknown>): Promise<void> {
  await db
    .update(eventInstance)
    .set({ state })
    .where(eq(eventInstance.id, BigInt(id)));
}
