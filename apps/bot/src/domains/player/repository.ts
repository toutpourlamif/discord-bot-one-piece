import { db, player, type Player } from '@one-piece/db';
import { and, eq, gte, sql } from 'drizzle-orm';

import { NotFoundError } from '../../discord/errors.js';

export async function findById(id: number): Promise<Player | undefined> {
  const [row] = await db.select().from(player).where(eq(player.id, id)).limit(1);
  return row;
}

export async function findByIdOrThrow(id: number): Promise<Player> {
  const row = await findById(id);
  if (!row) throw new NotFoundError('Joueur introuvable.');
  return row;
}

export async function findByDiscordId(discordId: string): Promise<Player | undefined> {
  const [row] = await db.select().from(player).where(eq(player.discordId, discordId)).limit(1);
  return row;
}

export async function create(discordId: string, name: string): Promise<Player> {
  const [row] = await db.insert(player).values({ discordId, name }).returning();
  return row!;
}

export async function updateName(playerId: number, name: string): Promise<Player> {
  const [row] = await db.update(player).set({ name }).where(eq(player.id, playerId)).returning();
  return row!;
}

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
