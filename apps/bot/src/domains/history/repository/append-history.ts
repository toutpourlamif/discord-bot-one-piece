import { db, history, type DbOrTransaction } from '@one-piece/db';

import type { HistoryTarget } from '../types/common.js';
import type { Log } from '../types/registry.js';

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
    type,
    actorPlayerId,
    bucketId,
    targetType: target?.type,
    targetId: target?.id,
    payload,
    occurredAt,
  });
}
