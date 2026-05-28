import { db, history, type DbOrTransaction } from '@one-piece/db';
import { and, eq, type SQL } from 'drizzle-orm';

import { buildKindMatcher } from '../utils/build-kind-matcher.js';

type Options = {
  kind?: string;
  client?: DbOrTransaction;
};

export async function deleteForPlayer(playerId: number, { kind, client = db }: Options = {}): Promise<number> {
  const conditions: Array<SQL> = [eq(history.actorPlayerId, playerId)];
  if (kind) conditions.push(buildKindMatcher(kind));

  const rows = await client
    .delete(history)
    .where(and(...conditions))
    .returning({ id: history.id });
  return rows.length;
}
