import { db, history, type DbOrTransaction } from '@one-piece/db';
import { sql } from 'drizzle-orm';

import type { HistoryTarget } from './types/common.js';
import type { Log } from './types/index.js';
import { parseHistoryTargetId } from './utils.js';

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
    targetId: parseHistoryTargetId(target?.id),
    payload,
  });
}

export type DrizzleTx = DbOrTransaction;

type WriteEventResolutionInput = {
  actorPlayerId: number;
  eventType: string;
  bucketId: number;
  payload?: Record<string, unknown> | null;
  targetType?: string | null;
  targetId?: string | null;
  tx?: DrizzleTx;
};

export async function writeEventResolution({
  actorPlayerId,
  eventType,
  bucketId,
  payload,
  targetType,
  targetId,
  tx,
}: WriteEventResolutionInput): Promise<void> {
  const client = tx ?? db;

  await client.insert(history).values({
    actorPlayerId,
    eventType,
    bucketId,
    occurredAt: sql`now()`,
    payload: payload ?? {},
    targetType: targetType ?? null,
    targetId: parseHistoryTargetId(targetId),
  });
}
