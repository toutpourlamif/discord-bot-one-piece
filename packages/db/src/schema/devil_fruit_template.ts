import { sql } from 'drizzle-orm';
import { index, integer, pgEnum, pgTable, serial, varchar } from 'drizzle-orm/pg-core';

import { timestamps } from './helpers.js';

export const devilFruitType = pgEnum('devil_fruit_type', [
  'FEU',
  'GLACE',
  'MAGMA',
  'FOUDRE',
  'TENEBRES',
  'LUMIERE',
  'SABLE',
  'GAZ',
  'CAOUTCHOUC',
  'POISON',
]);

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
    ...timestamps(),
  },
  (table) => [
    index('devil_fruit_template_name_trgm_idx').using('gin', sql`${table.name} gin_trgm_ops`),
  ],
);
