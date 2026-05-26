import type { DbOrTransaction, JSONFromSQL } from '@one-piece/db';

import type { HistoryTarget } from '../types/common.js';
import type { Log } from '../types/index.js';

export type AppendHistoryArgs = Log & {
  actorPlayerId?: number;
  bucketId?: number;
  target?: HistoryTarget;
  client?: DbOrTransaction;
  occurredAt?: Date;
};

export type HistoryLog = {
  kind: string;
  occurredAt: Date;
  bucketId: number | null;
  payload: JSONFromSQL;
};

export type HistoryEntryId = {
  id: bigint;
};

export type WriteEventResolutionArgs = {
  actorPlayerId: number;
  kind: string;
  bucketId: number;
};
