import { db, devilFruitTemplate, type DevilFruitTemplate } from '@one-piece/db';
import { ilike, or, sql } from 'drizzle-orm';

export async function searchByName(query: string): Promise<Array<DevilFruitTemplate>> {
  return db
    .select()
    .from(devilFruitTemplate)
    .where(or(sql`${devilFruitTemplate.name} % ${query}`, ilike(devilFruitTemplate.name, `%${query}%`)))
    .orderBy(sql`similarity(${devilFruitTemplate.name}, ${query}) desc`)
    .limit(25);
}
