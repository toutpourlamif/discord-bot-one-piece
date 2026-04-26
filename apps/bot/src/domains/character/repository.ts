import { characterTemplate, db, type CharacterTemplate } from '@one-piece/db';
import { eq, getTableColumns, ilike, or, sql } from 'drizzle-orm';

export async function searchManyByName(query: string): Promise<Array<{ entity: CharacterTemplate; score: number }>> {
  const rows = await db
    .select({
      ...getTableColumns(characterTemplate),
      score: sql<number>`similarity(${characterTemplate.name}, ${query})`,
    })
    .from(characterTemplate)
    .where(or(sql`${characterTemplate.name} % ${query}`, ilike(characterTemplate.name, `%${query}%`)))
    .orderBy(sql`similarity(${characterTemplate.name}, ${query}) desc`)
    .limit(25);
  return rows.map(({ score, ...entity }) => ({ entity, score }));
}

export async function findById(id: number): Promise<CharacterTemplate | undefined> {
  const [row] = await db.select().from(characterTemplate).where(eq(characterTemplate.id, id)).limit(1);
  return row;
}
