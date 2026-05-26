import { db, history } from '@one-piece/db';

import type { AppendHistoryArgs } from './types.js';

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
