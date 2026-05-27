import { db, history, type DbOrTransaction } from '@one-piece/db';
import { and, desc, eq, type SQL } from 'drizzle-orm';

import { buildKindMatcher } from '../utils/build-kind-matcher.js';

type Options = {
  kind?: string;
  client?: DbOrTransaction;
};

export async function findLastIdForPlayer(playerId: number, { kind, client = db }: Options = {}): Promise<bigint | null> {
  const conditions: Array<SQL> = [eq(history.actorPlayerId, playerId)];
  if (kind) conditions.push(buildKindMatcher(kind));

  const [row] = await client
    .select({ id: history.id })
    .from(history)
    .where(and(...conditions))
    .orderBy(desc(history.occurredAt), desc(history.id))
    .limit(1);

  return row?.id ?? null;
}
