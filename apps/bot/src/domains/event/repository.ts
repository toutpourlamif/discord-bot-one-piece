import { db, eventInstance, type EventInstance } from '@one-piece/db';
import { asc, eq, and } from 'drizzle-orm';

import type { JSONFromSQL } from '../../shared/types.js';

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

export async function updateState(id: number, state: JSONFromSQL): Promise<void> {
  await db
    .update(eventInstance)
    .set({ state })
    .where(eq(eventInstance.id, BigInt(id)));
}

export async function findFirstInteractivePending(playerId: number): Promise<PendingEventInstance | null> {
  const [rows] = await db
    .select()
    .from(eventInstance)
    .where(and(eq(eventInstance.playerId, playerId), eq(eventInstance.isInteractive, true)))
    .orderBy(asc(eventInstance.bucketId), asc(eventInstance.id))
    .limit(1);

  if (!rows) return null;

  return {
    id: rows.id,
    eventKey: rows.eventKey,
    isInteractive: rows.isInteractive,
    bucketId: rows.bucketId,
    state: rows.state as JSONFromSQL,
    createdAt: rows.createdAt,
  };
}
