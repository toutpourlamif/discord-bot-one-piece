import { db, guild, type Guild } from '@one-piece/db';
import { eq } from 'drizzle-orm';

// TODO: multi-statement → service avec tx
export async function findOrCreate(guildId: string, name: string): Promise<Guild> {
  const [existing] = await db.select().from(guild).where(eq(guild.id, guildId)).limit(1);
  if (existing?.name === name) return existing;

  const [upserted] = await db
    .insert(guild)
    .values({ id: guildId, name })
    .onConflictDoUpdate({ target: guild.id, set: { name } })
    .returning();
  return upserted!;
}

export async function updatePrefix(guildId: string, prefix: string): Promise<Guild> {
  const [updated] = await db.update(guild).set({ prefix }).where(eq(guild.id, guildId)).returning();
  return updated!;
}
