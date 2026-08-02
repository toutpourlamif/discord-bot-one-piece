import { sql } from 'drizzle-orm';

import type { Db } from '../../../client.js';
import { logSeed } from '../../../shared/seed.js';

import { RESOURCE_TEMPLATES_DATA } from './data.js';
import { resourceTemplate } from './schema.js';

export async function seedResources(db: Db) {
  await db
    .insert(resourceTemplate)
    .values([...RESOURCE_TEMPLATES_DATA])
    .onConflictDoUpdate({
      target: resourceTemplate.name,
      set: {
        path: sql`excluded.path`,
        description: sql`excluded.description`,
        isQuestItem: sql`excluded.is_quest_item`,
      },
    });

  logSeed(resourceTemplate, RESOURCE_TEMPLATES_DATA);
}
