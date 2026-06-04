import { sql } from 'drizzle-orm';
import { index, integer, pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';

import { buildImageUrlColumn } from '../../../shared/columns/image-url-column.js';
import { buildPokemonTypesColumn } from '../../../shared/columns/pokemon-types-column.js';
import { buildRarityColumn } from '../../../shared/columns/rarity-column.js';
import { buildTimestampColumns } from '../../../shared/columns/timestamp-columns.js';

export const devilFruitTemplate = pgTable(
  'devil_fruit_template',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 128 }).notNull().unique(),
    types: buildPokemonTypesColumn(),
    hpBonus: integer('hp_bonus').notNull().default(0),
    combatBonus: integer('combat_bonus').notNull().default(0),
    rarity: buildRarityColumn(),
    ...buildImageUrlColumn(),
    description: text('description'),
    ...buildTimestampColumns(),
  },
  (table) => [index('devil_fruit_template_name_trgm_idx').using('gin', sql`${table.name} gin_trgm_ops`)],
);

export type DevilFruitTemplateInsert = typeof devilFruitTemplate.$inferInsert;
export type DevilFruitTemplate = typeof devilFruitTemplate.$inferSelect;
