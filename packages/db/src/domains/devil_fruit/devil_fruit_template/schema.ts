import { sql } from 'drizzle-orm';
import { index, integer, pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';

import { imageUrl, timestamps } from '../../../shared/helpers.js';
import { rarity } from '../../../shared/rarity.js';
import { devilFruitType } from '../enum.js';

export const devilFruitTemplate = pgTable(
  'devil_fruit_template',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 128 }).notNull().unique(),
    types: devilFruitType('types')
      .array()
      .notNull()
      .default(sql`'{}'::devil_fruit_type[]`),
    hpBonus: integer('hp_bonus').notNull().default(0),
    combatBonus: integer('combat_bonus').notNull().default(0),
    rarity: rarity('rarity').notNull().default('COMMON'),
    ...imageUrl(),
    description: text('description'),
    ...timestamps(),
  },
  (table) => [index('devil_fruit_template_name_trgm_idx').using('gin', sql`${table.name} gin_trgm_ops`)],
);

export type DevilFruitTemplateInsert = typeof devilFruitTemplate.$inferInsert;
export type DevilFruitTemplate = typeof devilFruitTemplate.$inferSelect;
