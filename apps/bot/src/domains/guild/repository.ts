import { db, guild, type Guild } from '@one-piece/db';
import { eq } from 'drizzle-orm';

export async function findOrCreate(guildId: string): Promise<Guild> {
  const [existing] = await db.select().from(guild).where(eq(guild.id, guildId)).limit(1);
  if (existing) return existing;

  const [created] = await db.insert(guild).values({ id: guildId }).returning();
  return created!;
}

export async function updatePrefix(guildId: string, prefix: string): Promise<Guild> {
  const [updated] = await db.update(guild).set({ prefix }).where(eq(guild.id, guildId)).returning();
  return updated!;
}
