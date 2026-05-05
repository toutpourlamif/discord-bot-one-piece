import { db, eventInstance } from '@one-piece/db';
import { asc, eq } from 'drizzle-orm';

export type PendingEventInstance = {
  id: bigint;
  eventKey: string;
  isInteractive: boolean;
  bucketId: number;
  state: Record<string, unknown>;
  createdAt: Date;
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
