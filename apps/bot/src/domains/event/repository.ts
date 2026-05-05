import { db, eventInstance } from '@one-piece/db';
import { asc, eq } from 'drizzle-orm';

export type PendingEventInstance = {
  id: number;
  type: string;
  scope: 'passive' | 'interactive';
  bucketId: number;
  encounterId: number | null;
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
    id: Number(row.id),
    type: row.eventKey,
    scope: row.isInteractive ? 'interactive' : 'passive',
    bucketId: row.bucketId,
    encounterId: null,
    state: row.state as Record<string, unknown>,
    createdAt: row.createdAt,
  }));
}
