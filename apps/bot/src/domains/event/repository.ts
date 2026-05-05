import { db, eventInstance } from '@one-piece/db';
import { eq } from 'drizzle-orm';

import type { JSONFromSQL } from '../../shared/types.js';

export async function updateState(id: number, state: JSONFromSQL): Promise<void> {
  await db
    .update(eventInstance)
    .set({ state })
    .where(eq(eventInstance.id, BigInt(id)));
}
