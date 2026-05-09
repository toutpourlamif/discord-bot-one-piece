import { db, guild, type Guild } from '@one-piece/db';
import { eq, sql } from 'drizzle-orm';

// TODO: MOVE DANS UN SERVICE
export async function findOrCreate(guildId: string, name: string): Promise<Guild> {
  const [upserted] = await db
    .insert(guild)
    .values({ id: guildId, name })
    .onConflictDoUpdate({
      target: guild.id,
      set: { name },
      setWhere: sql`${guild.name} <> excluded.name`,
    })
    .returning();
  if (upserted) return upserted;

  const [existing] = await db.select().from(guild).where(eq(guild.id, guildId)).limit(1);
  return existing!;
}
