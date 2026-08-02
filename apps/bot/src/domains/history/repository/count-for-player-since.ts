import { db, history, type DbOrTransaction } from '@one-piece/db';
import { and, count, eq, gte, type SQL } from 'drizzle-orm';

import { buildTypeMatcher } from '../utils/build-type-matcher.js';

type Options = {
  type?: string;
  client?: DbOrTransaction;
};

export async function countForPlayerSince(playerId: number, since: Date, { type, client = db }: Options = {}): Promise<number> {
  const conditions: Array<SQL> = [eq(history.actorPlayerId, playerId), gte(history.occurredAt, since)];
  if (type) conditions.push(buildTypeMatcher(type));

  const [row] = await client
    .select({ count: count() })
    .from(history)
    .where(and(...conditions));

  return row?.count ?? 0;
}
