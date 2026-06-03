import { sql } from 'drizzle-orm';
import { index, integer, pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';

import { imageUrl } from '../../../shared/columns/imageUrlColumn.js';
import { pokemonTypes } from '../../../shared/columns/pokemonTypesColumn.js';
import { rarityColumn } from '../../../shared/columns/rarityColumn.js';
import { timestamps } from '../../../shared/columns/timestampColumns.js';

export const devilFruitTemplate = pgTable(
  'devil_fruit_template',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 128 }).notNull().unique(),
    types: pokemonTypes(),
    hpBonus: integer('hp_bonus').notNull().default(0),
    combatBonus: integer('combat_bonus').notNull().default(0),
    rarity: rarityColumn(),
    ...imageUrl(),
    description: text('description'),
    ...timestamps(),
  },
  (table) => [index('devil_fruit_template_name_trgm_idx').using('gin', sql`${table.name} gin_trgm_ops`)],
);

export type DevilFruitTemplateInsert = typeof devilFruitTemplate.$inferInsert;
export type DevilFruitTemplate = typeof devilFruitTemplate.$inferSelect;
