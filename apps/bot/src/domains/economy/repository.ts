import { db, player } from '@one-piece/db';
import { and, eq, gte, sql } from 'drizzle-orm';

export async function debitBerry(playerId: number, amount: bigint): Promise<boolean> {
  const result = await db
    .update(player)
    .set({ berries: sql`${player.berries} - ${amount}` })
    .where(and(eq(player.id, playerId), gte(player.berries, amount)))
    .returning();

  return result.length > 0;
}

export async function creditBerry(playerId: number, amount: bigint): Promise<void> {
  await db
    .update(player)
    .set({ berries: sql`${player.berries} + ${amount}` })
    .where(eq(player.id, playerId));
}
