import { db, history, type DbOrTransaction } from '@one-piece/db';
import { and, desc, eq, type SQL } from 'drizzle-orm';

import { buildTypeMatcher } from '../utils/build-type-matcher.js';

export type LastHistoryEntry = { id: bigint; occurredAt: Date };

type Options = {
  type?: string;
  client?: DbOrTransaction;
};

export async function findLastForPlayer(playerId: number, { type, client = db }: Options = {}): Promise<LastHistoryEntry | null> {
  const conditions: Array<SQL> = [eq(history.actorPlayerId, playerId)];
  if (type) conditions.push(buildTypeMatcher(type));

  const [row] = await client
    .select({ id: history.id, occurredAt: history.occurredAt })
    .from(history)
    .where(and(...conditions))
    .orderBy(desc(history.occurredAt), desc(history.id))
    .limit(1);

  return row ?? null;
}
