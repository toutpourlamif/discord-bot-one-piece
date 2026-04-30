import { sql } from 'drizzle-orm';

import type { Db } from '../../../client.js';
import { logSeed } from '../../../shared/seed.js';
import { devilFruitTemplate } from '../../devil_fruit/devil_fruit_template/schema.js';

import { CHARACTER_TEMPLATES_DATA } from './data.js';
import { characterTemplate } from './schema.js';

async function buildFruitIdByName(db: Db): Promise<Map<string, number>> {
  const fruits = await db.select({ id: devilFruitTemplate.id, name: devilFruitTemplate.name }).from(devilFruitTemplate);
  return new Map(fruits.map((f) => [f.name, f.id]));
}

function resolveCharacterRows(fruitIdByName: Map<string, number>) {
  return CHARACTER_TEMPLATES_DATA.map(({ devilFruitName, ...rest }) => {
    if (devilFruitName !== undefined && !fruitIdByName.has(devilFruitName)) {
      throw new Error(`Fruit "${devilFruitName}" introuvable — vérifie DEVIL_FRUIT_TEMPLATES_DATA.`);
    }
    return {
      ...rest,
      devilFruitTemplateId: devilFruitName !== undefined ? fruitIdByName.get(devilFruitName)! : null,
    };
  });
}

export async function seedCharacter(db: Db) {
  const fruitIdByName = await buildFruitIdByName(db);
  const rows = resolveCharacterRows(fruitIdByName);

  await db
    .insert(characterTemplate)
    .values(rows)
    .onConflictDoUpdate({
      target: characterTemplate.name,
      set: {
        hp: sql`excluded.hp`,
        combat: sql`excluded.combat`,
        imageUrl: sql`excluded.image_url`,
        devilFruitTemplateId: sql`excluded.devil_fruit_template_id`,
      },
    });
  logSeed(characterTemplate, rows);
}
