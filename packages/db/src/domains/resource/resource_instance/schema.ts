import { sql } from 'drizzle-orm';
import { check, integer, pgTable, serial, uniqueIndex } from 'drizzle-orm/pg-core';

import { timestamps } from '../../../shared/helpers.js';
import { player } from '../../player/schema.js';
import { resourceTemplate } from '../resource_template/schema.js';

export const resourceInstance = pgTable(
  'resource_instance',
  {
    id: serial('id').primaryKey(),
    templateId: integer('template_id')
      .notNull()
      .references(() => resourceTemplate.id, { onDelete: 'restrict' }),
    playerId: integer('player_id')
      .notNull()
      .references(() => player.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull(),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex('resource_instance_player_template_uniq').on(table.playerId, table.templateId),
    check('resource_instance_quantity_non_negative', sql`${table.quantity} >= 0`),
  ],
);
