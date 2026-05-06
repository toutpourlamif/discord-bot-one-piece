import { db, history, type DbOrTransaction } from '@one-piece/db';
import { sql } from 'drizzle-orm';

import type { JSONFromSQL } from '../../shared/types.js';

import type { HistoryTarget } from './types/common.js';
import type { Log } from './types/index.js';

type AppendHistoryArgs = Log & {
  actorPlayerId?: number;
  target?: HistoryTarget;
  client?: DbOrTransaction;
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

export type DrizzleTx = DbOrTransaction;

type WriteEventResolutionInput = {
  actorPlayerId: number;
  eventType: string;
  bucketId: number;
  payload?: JSONFromSQL | null;
  target?: HistoryTarget;
  tx?: DrizzleTx;
};

export async function writeEventResolution({
  actorPlayerId,
  eventType,
  bucketId,
  payload,
  target,
  tx,
}: WriteEventResolutionInput): Promise<void> {
  const client = tx ?? db;

  await client.insert(history).values({
    actorPlayerId,
    eventType,
    bucketId,
    occurredAt: sql`now()`,
    payload: payload ?? {},
    targetType: target?.type,
    targetId: target?.id,
  });
}
