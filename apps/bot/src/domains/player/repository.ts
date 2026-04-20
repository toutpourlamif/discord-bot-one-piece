import { db, player, type Player } from '@one-piece/db';
import { eq } from 'drizzle-orm';

export async function findByDiscordId(discordId: string): Promise<Player | undefined> {
  const [row] = await db.select().from(player).where(eq(player.discordId, discordId)).limit(1);
  return row;
}

export async function create(discordId: string, name: string): Promise<Player> {
  const [row] = await db.insert(player).values({ discordId, name }).returning();
  return row!;
}
