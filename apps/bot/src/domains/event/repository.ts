import { db, eventInstance, type DbOrTransaction, type EventInstance, type JSONFromSQL } from '@one-piece/db';
import { and, asc, count, eq, type SQL } from 'drizzle-orm';

export type PendingEventInstance = Omit<EventInstance, 'playerId' | 'state'> & {
  state: Record<string, unknown>;
};

export async function getPendingEventsForPlayer(playerId: number): Promise<Array<PendingEventInstance>> {
  const rows = await db
    .select()
    .from(eventInstance)
    .where(eq(eventInstance.playerId, playerId))
    .orderBy(asc(eventInstance.bucketId), asc(eventInstance.id));

  return rows.map((row) => ({
    id: row.id,
    eventKey: row.eventKey,
    isInteractive: row.isInteractive,
    bucketId: row.bucketId,
    state: row.state as Record<string, unknown>,
    createdAt: row.createdAt,
  }));
}

export async function updateState(id: bigint, state: JSONFromSQL): Promise<void> {
  await db.update(eventInstance).set({ state }).where(eq(eventInstance.id, id));
}

export async function findById(id: bigint): Promise<EventInstance | null> {
  const [row] = await db.select().from(eventInstance).where(eq(eventInstance.id, id)).limit(1);
  return row ?? null;
}

export async function findFirstInteractivePending(playerId: number, client: DbOrTransaction = db): Promise<EventInstance | null> {
  const [row] = await client
    .select()
    .from(eventInstance)
    .where(and(eq(eventInstance.playerId, playerId), eq(eventInstance.isInteractive, true)))
    .orderBy(asc(eventInstance.bucketId), asc(eventInstance.id))
    .limit(1);

  if (!row) return null;

  return row;
}

export async function deleteById(id: bigint, client: DbOrTransaction = db): Promise<{ deleted: boolean }> {
  const rows = await client.delete(eventInstance).where(eq(eventInstance.id, id)).returning({ id: eventInstance.id });
  return { deleted: rows.length > 0 };
}

type CountPendingEventsOptions = {
  eventKey?: string;
  client?: DbOrTransaction;
};

export async function countPendingEventsForPlayer(
  playerId: number,
  { eventKey, client = db }: CountPendingEventsOptions = {},
): Promise<number> {
  const conditions: Array<SQL> = [eq(eventInstance.playerId, playerId)];
  if (eventKey) conditions.push(eq(eventInstance.eventKey, eventKey));

  const [row] = await client
    .select({ count: count() })
    .from(eventInstance)
    .where(and(...conditions));

  return row?.count ?? 0;
}

type InsertWithIdempotenceArgs = {
  playerId: number;
  eventKey: string;
  isInteractive: boolean;
  bucketId: number;
  state: JSONFromSQL;
};

export async function insertWithIdempotence(args: InsertWithIdempotenceArgs, client: DbOrTransaction = db): Promise<void> {
  await client
    .insert(eventInstance)
    .values(args)
    .onConflictDoNothing({ target: [eventInstance.playerId, eventInstance.eventKey, eventInstance.bucketId] });
}
