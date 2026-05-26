import { db, history, type DbOrTransaction } from '@one-piece/db';
import { sql } from 'drizzle-orm';

import type { WriteEventResolutionArgs } from './types.js';

export async function writeEventResolution(args: WriteEventResolutionArgs, client: DbOrTransaction = db): Promise<void> {
  await client
    .insert(history)
    .values(args)
    .onConflictDoNothing({
      target: [history.actorPlayerId, history.kind, history.bucketId],
      where: sql`${history.actorPlayerId} IS NOT NULL AND ${history.bucketId} IS NOT NULL`,
    });
}
