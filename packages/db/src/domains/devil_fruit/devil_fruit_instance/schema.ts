import { integer, pgTable, serial, uniqueIndex } from 'drizzle-orm/pg-core';

import { timestamps } from '../../../shared/helpers.js';
import { player } from '../../player/schema.js';
import { devilFruitTemplate } from '../devil_fruit_template/schema.js';

export const devilFruitInstance = pgTable(
  'devil_fruit_instance',
  {
    id: serial('id').primaryKey(),
    templateId: integer('template_id')
      .notNull()
      .references(() => devilFruitTemplate.id, { onDelete: 'restrict' }),
    playerId: integer('player_id')
      .notNull()
      .references(() => player.id, { onDelete: 'cascade' }),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex('devil_fruit_instance_player_template_uniq').on(table.playerId, table.templateId),
  ],
);
