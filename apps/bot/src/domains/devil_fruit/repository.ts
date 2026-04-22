import { db, devilFruitTemplate, type DevilFruitTemplate } from '@one-piece/db';
import { eq, ilike, or, sql } from 'drizzle-orm';

export async function searchManyByName(query: string): Promise<Array<DevilFruitTemplate>> {
  return db
    .select()
    .from(devilFruitTemplate)
    .where(or(sql`${devilFruitTemplate.name} % ${query}`, ilike(devilFruitTemplate.name, `%${query}%`)))
    .orderBy(sql`similarity(${devilFruitTemplate.name}, ${query}) desc`)
    .limit(25);
}

export async function findById(id: number): Promise<DevilFruitTemplate | undefined> {
  const [row] = await db.select().from(devilFruitTemplate).where(eq(devilFruitTemplate.id, id)).limit(1);
  return row;
}
