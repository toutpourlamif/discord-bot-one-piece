import { db, resourceInstance, resourceTemplate, type ResourceTemplate } from '@one-piece/db';
import { asc, eq, sql } from 'drizzle-orm';

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

export async function listTemplates(): Promise<Array<ResourceTemplate>> {
  return db.select().from(resourceTemplate);
}

export async function addResourceToPlayer(playerId: number, templateId: number, quantity: number): Promise<void> {
  await db
    .insert(resourceInstance)
    .values({ playerId, templateId, quantity })
    .onConflictDoUpdate({
      target: [resourceInstance.playerId, resourceInstance.templateId],
      set: { quantity: sql`${resourceInstance.quantity} + ${quantity}` },
    });
}
