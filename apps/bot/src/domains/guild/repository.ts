import { db, guild } from '@one-piece/db';

export async function ensureExists(guildId: string): Promise<void> {
  await db.insert(guild).values({ id: guildId }).onConflictDoNothing();
}
