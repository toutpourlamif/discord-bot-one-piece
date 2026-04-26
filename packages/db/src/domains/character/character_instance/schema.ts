import { sql } from 'drizzle-orm';
import { boolean, check, integer, pgTable, serial, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

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
    joinedCrewAt: timestamp('joined_crew_at', { withTimezone: true }),
    isCaptain: boolean('is_captain').notNull().default(false),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex('character_instance_player_template_uniq').on(table.playerId, table.templateId),
    uniqueIndex('character_instance_one_captain_per_player')
      .on(table.playerId)
      .where(sql`${table.isCaptain}`),
    check('character_instance_captain_must_be_in_crew', sql`NOT ${table.isCaptain} OR ${table.joinedCrewAt} IS NOT NULL`),
  ],
);

export type CharacterInstance = typeof characterInstance.$inferSelect;
