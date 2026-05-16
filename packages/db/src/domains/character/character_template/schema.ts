import { sql } from 'drizzle-orm';
import { index, integer, pgTable, serial, varchar, text } from 'drizzle-orm/pg-core';

import { imageUrl, timestamps } from '../../../shared/helpers.js';
import { rarity } from '../../../shared/rarity.js';
import { devilFruitTemplate } from '../../devil_fruit/devil_fruit_template/schema.js';
import { characterRaceEnum } from '../enum.js';
import { characterSkillEnum } from '../skill-enum.js';
export const characterTemplate = pgTable(
  'character_template',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 128 }).notNull().unique(),
    description: text('description'),
    hp: integer('hp').notNull().default(100),
    combat: integer('combat').notNull().default(10),
    devilFruitTemplateId: integer('devil_fruit_template_id').references(() => devilFruitTemplate.id, {
      onDelete: 'restrict',
    }),
    rarity: rarity('rarity').notNull().default('COMMON'),

    race: characterRaceEnum('race').notNull(),
    ...imageUrl(),
    ...timestamps(),

    skill: characterSkillEnum('skill').notNull().array(),
  },
  (table) => [index('character_template_name_trgm_idx').using('gin', sql`${table.name} gin_trgm_ops`)],
);

export type CharacterTemplateInsert = typeof characterTemplate.$inferInsert;
export type CharacterTemplate = typeof characterTemplate.$inferSelect;
