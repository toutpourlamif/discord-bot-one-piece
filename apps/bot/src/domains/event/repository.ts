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

export async function updateState(id: bigint, state: JSONFromSQL): Promise<void> {
  await db.update(eventInstance).set({ state }).where(eq(eventInstance.id, id));
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

export async function deleteById(id: bigint): Promise<{ deleted: boolean }> {
  const rows = await db.delete(eventInstance).where(eq(eventInstance.id, id)).returning({ id: eventInstance.id });
  return { deleted: rows.length > 0 };
}
