import { db, history, type DbOrTransaction } from '@one-piece/db';

import type { HistorySource, HistoryTarget } from './types/common.js';
import type { Log } from './types/index.js';

type AppendHistoryArgs = Log & {
  actorPlayerId?: number;
  target?: HistoryTarget;
  source?: HistorySource;
  client?: DbOrTransaction;
};

export async function appendHistory({ type, payload, actorPlayerId, target, source, client = db }: AppendHistoryArgs): Promise<void> {
  await client.insert(history).values({
    eventType: type,
    actorPlayerId,
    targetType: target?.type,
    targetId: target?.id,
    payload,
    source,
  });
}
