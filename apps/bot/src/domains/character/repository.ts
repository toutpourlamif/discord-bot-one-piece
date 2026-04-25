import { characterTemplate, db, type CharacterTemplate } from '@one-piece/db';
import { eq, ilike, or, sql } from 'drizzle-orm';

export async function searchManyByName(query: string): Promise<Array<CharacterTemplate>> {
  return db
    .select()
    .from(characterTemplate)
    .where(or(sql`${characterTemplate.name} % ${query}`, ilike(characterTemplate.name, `%${query}%`)))
    .orderBy(sql`similarity(${characterTemplate.name}, ${query}) desc`)
    .limit(25);
}

export async function findById(id: number): Promise<CharacterTemplate | undefined> {
  const [row] = await db.select().from(characterTemplate).where(eq(characterTemplate.id, id)).limit(1);
  return row;
}
