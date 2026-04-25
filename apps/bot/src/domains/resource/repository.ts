import { db, resourceInstance, resourceTemplate, type ResourceTemplate } from '@one-piece/db';
import { asc, eq, ilike, or, sql } from 'drizzle-orm';

import type { Inventory } from './types.js';

export async function getInventory(playerId: number): Promise<Inventory> {
  return db
    .select({
      name: resourceTemplate.name,
      quantity: resourceInstance.quantity,
    })
    .from(resourceInstance)
    .innerJoin(resourceTemplate, eq(resourceInstance.templateId, resourceTemplate.id))
    .where(eq(resourceInstance.playerId, playerId))
    .orderBy(asc(resourceTemplate.name));
}

export async function searchManyByName(query: string): Promise<Array<ResourceTemplate>> {
  return db
    .select()
    .from(resourceTemplate)
    .where(or(sql`${resourceTemplate.name} % ${query}`, ilike(resourceTemplate.name, `%${query}%`)))
    .orderBy(sql`similarity(${resourceTemplate.name}, ${query}) desc`)
    .limit(25);
}

export async function findById(id: number): Promise<ResourceTemplate | undefined> {
  const [row] = await db.select().from(resourceTemplate).where(eq(resourceTemplate.id, id)).limit(1);
  return row;
}
