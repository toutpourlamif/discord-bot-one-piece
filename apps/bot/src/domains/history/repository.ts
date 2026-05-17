import { db, history, type DbOrTransaction, type JSONFromSQL } from '@one-piece/db';
import { asc, eq, sql } from 'drizzle-orm';

import type { HistoryTarget } from './types/common.js';
import type { Log } from './types/index.js';

type AppendHistoryArgs = Log & {
  actorPlayerId?: number;
  bucketId?: number;
  target?: HistoryTarget;
  client?: DbOrTransaction;
  occurredAt?: Date;
};

export async function appendHistory({
  type,
  payload,
  actorPlayerId,
  bucketId,
  target,
  client = db,
  occurredAt,
}: AppendHistoryArgs): Promise<void> {
  await client.insert(history).values({
    kind: type,
    actorPlayerId,
    bucketId,
    targetType: target?.type,
    targetId: target?.id,
    payload,
    occurredAt,
  });
}

export type HistoryLog = {
  kind: string;
  occurredAt: Date;
  bucketId: number | null;
  payload: JSONFromSQL;
};

export async function loadAllForPlayer(playerId: number, client: DbOrTransaction = db): Promise<Array<HistoryLog>> {
  return client
    .select({
      kind: history.kind,
      occurredAt: history.occurredAt,
      bucketId: history.bucketId,
      payload: history.payload,
    })
    .from(history)
    .where(eq(history.actorPlayerId, playerId))
    .orderBy(asc(history.occurredAt));
}

type WriteEventResolutionArgs = {
  actorPlayerId: number;
  kind: string;
  bucketId: number;
};

export async function writeEventResolution(args: WriteEventResolutionArgs, client: DbOrTransaction = db): Promise<void> {
  await client
    .insert(history)
    .values(args)
    .onConflictDoNothing({
      target: [history.actorPlayerId, history.kind, history.bucketId],
      where: sql`${history.actorPlayerId} IS NOT NULL AND ${history.bucketId} IS NOT NULL`,
    });
}
