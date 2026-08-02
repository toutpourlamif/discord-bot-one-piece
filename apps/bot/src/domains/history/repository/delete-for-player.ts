import { db, history, type DbOrTransaction } from '@one-piece/db';
import { and, eq, type SQL } from 'drizzle-orm';

import { buildTypeMatcher } from '../utils/build-type-matcher.js';

type Options = {
  type?: string;
  client?: DbOrTransaction;
};

export async function deleteForPlayer(playerId: number, { type, client = db }: Options = {}): Promise<number> {
  const conditions: Array<SQL> = [eq(history.actorPlayerId, playerId)];
  if (type) conditions.push(buildTypeMatcher(type));

  const rows = await client
    .delete(history)
    .where(and(...conditions))
    .returning({ id: history.id });
  return rows.length;
}
