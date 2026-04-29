import { sql } from 'drizzle-orm';

import type { Db } from '../../../client.js';
import { logSeed } from '../../../shared/seed.js';

import { DEVIL_FRUIT_TEMPLATES_DATA } from './data.js';
import { devilFruitTemplate } from './schema.js';

export async function seedDevilFruits(db: Db) {
  await db
    .insert(devilFruitTemplate)
    .values([...DEVIL_FRUIT_TEMPLATES_DATA])
    .onConflictDoUpdate({
      target: devilFruitTemplate.name,
      set: {
        types: sql`excluded.types`,
        hpBonus: sql`excluded.hp_bonus`,
        combatBonus: sql`excluded.combat_bonus`,
        imageUrl: sql`excluded.image_url`,
      },
    });
  logSeed(devilFruitTemplate, DEVIL_FRUIT_TEMPLATES_DATA);
}
