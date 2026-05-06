import { db, history, type DbOrTransaction } from '@one-piece/db';
import { sql } from 'drizzle-orm';

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

function parseHistoryTargetId(targetId: string | null | undefined): number | null {
  if (targetId == null) {
    return null;
  }

  const parsed = Number(targetId);

  if (!Number.isInteger(parsed)) {
    throw new TypeError('history targetId must be an integer string');
  }

  return parsed;
}
