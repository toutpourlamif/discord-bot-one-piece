import { db, history, type DbOrTransaction } from '@one-piece/db';
import { asc, eq } from 'drizzle-orm';

import type { JSONFromSQL } from '../../shared/types.js';

import type { HistoryTarget } from './types/common.js';
import type { Log } from './types/index.js';

type AppendHistoryArgs = Log & {
  actorPlayerId?: number;
  target?: HistoryTarget;
  client?: DbOrTransaction;
};

export type HistoryEntry = {
  eventType: string;
  occurredAt: Date;
  bucketId: number | null;
  payload: JSONFromSQL | null;
};

export async function appendHistory({ type, payload, actorPlayerId, target, client = db }: AppendHistoryArgs): Promise<void> {
  await client.insert(history).values({
    eventType: type,
    actorPlayerId,
    targetType: target?.type,
    targetId: target?.id,
    payload,
  });
}

export async function loadAllForPlayer(playerId: number): Promise<Array<HistoryEntry>> {
  const rows = await db
    .select({
      eventType: history.eventType,
      occurredAt: history.occurredAt,
      bucketId: history.bucketId,
      payload: history.payload,
    })
    .from(history)
    .where(eq(history.actorPlayerId, playerId))
    .orderBy(asc(history.occurredAt));

  return rows.map((row) => ({
    ...row,
    payload: row.payload as JSONFromSQL | null,
  }));
}
