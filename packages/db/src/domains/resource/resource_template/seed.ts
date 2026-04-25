import { sql } from 'drizzle-orm';

import type { Db } from '../../../client.js';
import { logSeed } from '../../../shared/seed.js';
import { player } from '../../player/schema.js';
import { resourceInstance } from '../resource_instance/schema.js';

import { RESOURCE_TEMPLATES_DATA } from './data.js';
import { resourceTemplate } from './schema.js';

export async function seedResources(db: Db) {
  await db
    .insert(resourceTemplate)
    .values([...RESOURCE_TEMPLATES_DATA])
    .onConflictDoUpdate({
      target: resourceTemplate.name,
      set: {
        imageUrl: sql`excluded.image_url`,
        description: sql`excluded.description`,
      },
    });

  logSeed(resourceTemplate, RESOURCE_TEMPLATES_DATA);

  await seedDevResourceInstances(db);
}

async function seedDevResourceInstances(db: Db) {
  const players = await db.select({ id: player.id }).from(player);
  if (players.length === 0) return;

  const templates = await db
    .select({ id: resourceTemplate.id, name: resourceTemplate.name })
    .from(resourceTemplate)
    .where(sql`${resourceTemplate.name} in ('Bois', 'Fer')`);

  const bois = templates.find((template) => template.name === 'Bois');
  const fer = templates.find((template) => template.name === 'Fer');
  if (!bois || !fer) return;

  const values = players.flatMap((player) => [
    { playerId: player.id, templateId: bois.id, quantity: 210 },
    { playerId: player.id, templateId: fer.id, quantity: 90 },
  ]);

  await db
    .insert(resourceInstance)
    .values(values)
    .onConflictDoUpdate({
      target: [resourceInstance.playerId, resourceInstance.templateId],
      set: {
        quantity: sql`excluded.quantity`,
      },
    });

  logSeed(resourceInstance, values);
}
