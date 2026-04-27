import { sql } from 'drizzle-orm';

import type { Db } from '../../../client.js';
import { logSeed } from '../../../shared/seed.js';

import { CHARACTER_TEMPLATES_DATA } from './data.js';
import { characterTemplate } from './schema.js';

export async function seedCharacter(db: Db) {
  await db
    .insert(characterTemplate)
    .values(CHARACTER_TEMPLATES_DATA)
    .onConflictDoUpdate({
      target: characterTemplate.name,
      set: {
        hp: sql`excluded.hp`,
        combat: sql`excluded.combat`,
        imageUrl: sql`excluded.image_url`,
      },
    });
  logSeed(characterTemplate, CHARACTER_TEMPLATES_DATA);
}
