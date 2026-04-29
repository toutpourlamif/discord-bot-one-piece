import { sql } from 'drizzle-orm';
import { index, integer, pgTable, serial, varchar } from 'drizzle-orm/pg-core';

import { imageUrl, timestamps } from '../../../shared/helpers.js';
import { devilFruitTemplate } from '../../devil_fruit/devil_fruit_template/schema.js';

export const characterTemplate = pgTable(
  'character_template',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 128 }).notNull().unique(),
    hp: integer('hp').notNull().default(100),
    combat: integer('combat').notNull().default(10),
    devilFruitTemplateId: integer('devil_fruit_template_id').references(() => devilFruitTemplate.id, {
      onDelete: 'restrict',
    }),
    ...imageUrl(),
    ...timestamps(),
  },
  (table) => [index('character_template_name_trgm_idx').using('gin', sql`${table.name} gin_trgm_ops`)],
);

export type CharacterTemplateInsert = typeof characterTemplate.$inferInsert;
export type CharacterTemplate = typeof characterTemplate.$inferSelect;
