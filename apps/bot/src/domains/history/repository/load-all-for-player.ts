import { db, history, type DbOrTransaction, type JSONFromSQL } from '@one-piece/db';
import { asc, eq } from 'drizzle-orm';

export type HistoryLog = {
  kind: string;
  occurredAt: Date;
  bucketId: number | null;
  payload: JSONFromSQL;
};

export async function loadAllForPlayer(playerId: number, client: DbOrTransaction = db): Promise<Array<HistoryLog>> {
  return client
    .select({
      kind: history.kind,
      occurredAt: history.occurredAt,
      bucketId: history.bucketId,
      payload: history.payload,
    })
    .from(history)
    .where(eq(history.actorPlayerId, playerId))
    .orderBy(asc(history.occurredAt));
}
