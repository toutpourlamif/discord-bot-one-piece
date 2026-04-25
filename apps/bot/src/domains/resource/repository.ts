import { db, resourceInstance, resourceTemplate } from '@one-piece/db';
import { asc, eq } from 'drizzle-orm';

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
