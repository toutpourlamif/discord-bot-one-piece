import { db, eventInstance, type EventInstance, type JSONFromSQL } from '@one-piece/db';
import { asc, eq, and } from 'drizzle-orm';

export async function getPendingEventsForPlayer(playerId: number): Promise<Array<EventInstance>> {
  const rows = await db
    .select()
    .from(eventInstance)
    .where(eq(eventInstance.playerId, playerId))
    .orderBy(asc(eventInstance.bucketId), asc(eventInstance.id));

  return rows;
}

export async function updateState(id: number, state: JSONFromSQL): Promise<void> {
  await db
    .update(eventInstance)
    .set({ state })
    .where(eq(eventInstance.id, BigInt(id)));
}

export async function findFirstInteractivePending(playerId: number): Promise<EventInstance | null> {
  const [row] = await db
    .select()
    .from(eventInstance)
    .where(and(eq(eventInstance.playerId, playerId), eq(eventInstance.isInteractive, true)))
    .orderBy(asc(eventInstance.bucketId), asc(eventInstance.id))
    .limit(1);

  if (!row) return null;

  return row;
}
