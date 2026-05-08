import { db, guild, type Guild } from '@one-piece/db';
import { eq } from 'drizzle-orm';

// TODO: MOVE DANS UN SERVICE
export async function findOrCreate(guildId: string): Promise<Guild> {
  const [existing] = await db.select().from(guild).where(eq(guild.id, guildId)).limit(1);
  if (existing) return existing;

  const [created] = await db.insert(guild).values({ id: guildId }).returning();
  return created!;
}
