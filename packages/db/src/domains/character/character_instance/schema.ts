import { integer, pgTable, serial, uniqueIndex } from 'drizzle-orm/pg-core';

import { timestamps } from '../../../shared/helpers.js';
import { player } from '../../player/schema.js';
import { characterTemplate } from '../character_template/schema.js';

export const characterInstance = pgTable(
  'character_instance',
  {
    id: serial('id').primaryKey(),
    templateId: integer('template_id')
      .notNull()
      .references(() => characterTemplate.id, { onDelete: 'restrict' }),
    playerId: integer('player_id')
      .notNull()
      .references(() => player.id, { onDelete: 'cascade' }),
    ...timestamps(),
  },
  (table) => [uniqueIndex('character_instance_player_template_uniq').on(table.playerId, table.templateId)],
);

export type CharacterInstance = typeof characterInstance.$inferSelect;
