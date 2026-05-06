import { db, history, type DbOrTransaction, type JSONFromSQL } from '@one-piece/db';
import { asc, eq } from 'drizzle-orm';

import type { HistoryTarget } from './types/common.js';
import type { Log } from './types/index.js';

type AppendHistoryArgs = Log & {
  actorPlayerId?: number;
  bucketId?: number;
  target?: HistoryTarget;
  client?: DbOrTransaction;
};

export async function appendHistory({ type, payload, actorPlayerId, bucketId, target, client = db }: AppendHistoryArgs): Promise<void> {
  await client.insert(history).values({
    eventType: type,
    actorPlayerId,
    bucketId,
    targetType: target?.type,
    targetId: target?.id,
    payload,
  });
}

type HistoryEntry = {
  eventType: string;
  occurredAt: Date;
  bucketId: number | null;
  payload: JSONFromSQL;
};

export async function loadAllForPlayer(playerId: number): Promise<Array<HistoryEntry>> {
  return db
    .select({
      eventType: history.eventType,
      occurredAt: history.occurredAt,
      bucketId: history.bucketId,
      payload: history.payload,
    })
    .from(history)
    .where(eq(history.actorPlayerId, playerId))
    .orderBy(asc(history.occurredAt));
}
