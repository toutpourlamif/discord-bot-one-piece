import { db, player } from '@one-piece/db';
import { and, eq, gte, sql } from 'drizzle-orm';

import { NotFoundError } from '../../discord/errors.js';

export async function debitBerry(playerId: number, amount: bigint): Promise<bigint | null> {
  const [updated] = await db
    .update(player)
    .set({ berries: sql`${player.berries} - ${amount}` })
    .where(and(eq(player.id, playerId), gte(player.berries, amount)))
    .returning({ berries: player.berries });

  return updated?.berries ?? null;
}
export async function creditBerry(playerId: number, amount: bigint): Promise<bigint> {
  const [updated] = await db
    .update(player)
    .set({ berries: sql`${player.berries} + ${amount}` })
    .where(eq(player.id, playerId))
    .returning({ berries: player.berries });

  if (!updated) throw new NotFoundError(`player ${playerId} introuvable`);

  return updated.berries;
}
