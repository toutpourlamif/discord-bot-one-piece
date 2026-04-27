import { db, resourceInstance, resourceTemplate, type ResourceTemplate } from '@one-piece/db';
import { asc, eq, getTableColumns, ilike, or, sql } from 'drizzle-orm';

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

export async function listAllTemplates(): Promise<Array<ResourceTemplate>> {
  return db.select().from(resourceTemplate);
}

/** Ajoute n quantité d'une ressource à un joueur, si il avait déjà x ressource, alors la quantité devient x + y */
export async function addResourceToPlayer(playerId: number, templateId: number, quantity: number): Promise<void> {
  await db
    .insert(resourceInstance)
    .values({ playerId, templateId, quantity })
    .onConflictDoUpdate({
      target: [resourceInstance.playerId, resourceInstance.templateId],
      set: { quantity: sql`${resourceInstance.quantity} + ${quantity}` },
    });
}

export async function searchManyByName(query: string): Promise<Array<{ entity: ResourceTemplate; score: number }>> {
  const rows = await db
    .select({
      ...getTableColumns(resourceTemplate),
      score: sql<number>`similarity(${resourceTemplate.name}, ${query})`,
    })
    .from(resourceTemplate)
    .where(or(sql`${resourceTemplate.name} % ${query}`, ilike(resourceTemplate.name, `%${query}%`)))
    .orderBy(sql`similarity(${resourceTemplate.name}, ${query}) desc`)
    .limit(25);
  return rows.map(({ score, ...entity }) => ({ entity, score }));
}

export async function findById(id: number): Promise<ResourceTemplate | undefined> {
  const [row] = await db.select().from(resourceTemplate).where(eq(resourceTemplate.id, id)).limit(1);
  return row;
}
