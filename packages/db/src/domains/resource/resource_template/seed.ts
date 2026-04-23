import chalk from 'chalk';
import { sql } from 'drizzle-orm';

import type { Db } from '../../../client.js';
import { logSeed } from '../../../shared/seed.js';

import { RESOURCE_TEMPLATES_DATA } from './data.js';
import { resourceTemplate } from './schema.js';

export async function seedResources(db: Db) {
  await db
    .insert(resourceTemplate)
    .values(RESOURCE_TEMPLATES_DATA)
    .onConflictDoUpdate({
      target: resourceTemplate.name,
      set: {
        imageUrl: sql`excluded.image_url`,
        description: sql`excluded.description`,
      },
    });

  logSeed(resourceTemplate, RESOURCE_TEMPLATES_DATA);
  console.log(
    `Ressources ${chalk.green('OK')} ${chalk.yellow(`(${RESOURCE_TEMPLATES_DATA.length})`)} ${chalk.blue(
      RESOURCE_TEMPLATES_DATA.map((resource) => resource.name).join(', '),
    )}`,
  );
}
