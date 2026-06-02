import { sql } from 'drizzle-orm';
import { index, integer, pgTable, serial, varchar, text, real } from 'drizzle-orm/pg-core';

import { imageUrl, timestamps } from '../../../shared/helpers.js';
import { pokemonType } from '../../../shared/pokemon-type-enum.js';
import { rarityColumn } from '../../../shared/rarity-enum.js';
import { devilFruitTemplate } from '../../devil_fruit/devil_fruit_template/schema.js';
import { player } from '../../player/schema.js';
import { characterRaceEnum } from '../enum.js';
import { characterSkillEnum } from '../skill-enum.js';
export const characterTemplate = pgTable(
  'character_template',
  {
    id: serial('id').primaryKey(),
    // Nullable : les templates perso d'un joueur n'ont pas de nom (le nickname de l'instance porte le nom affiché).
    name: varchar('name', { length: 128 }).unique(),
    // Renseigné uniquement pour le template perso d'un joueur ; null pour les templates recrutables.
    playerId: integer('player_id').references(() => player.id, { onDelete: 'cascade' }),
    description: text('description'),
    hp: integer('hp').notNull().default(100),
    combat: integer('combat').notNull().default(10),
    devilFruitTemplateId: integer('devil_fruit_template_id').references(() => devilFruitTemplate.id, {
      onDelete: 'restrict',
    }),
    ...rarityColumn(),
    captainCombatMultiplier: real('captain_combat_multiplier').notNull().default(1),
    captainHpMultiplier: real('captain_hp_multiplier').notNull().default(1),
    captainBerryGainMultiplier: real('captain_berry_gain_multiplier').notNull().default(1),
    captainKarmaMultiplier: real('captain_karma_multiplier').notNull().default(1),
    captainMoraleMultiplier: real('captain_morale_multiplier').notNull().default(1),

    race: characterRaceEnum('race').notNull(),
    types: pokemonType('types')
      .array()
      .notNull()
      .default(sql`'{}'::pokemon_type[]`),
    ...imageUrl(),
    ...timestamps(),

    skills: characterSkillEnum('skills')
      .array()
      .notNull()
      .default(sql`'{}'::character_skill[]`),
  },
  (table) => [index('character_template_name_trgm_idx').using('gin', sql`${table.name} gin_trgm_ops`)],
);

export type CharacterTemplateInsert = typeof characterTemplate.$inferInsert;
export type CharacterTemplate = typeof characterTemplate.$inferSelect;
export type CharacterCombatStats = Pick<CharacterTemplate, 'combat' | 'hp'>;
export type CaptainBoosts = Pick<
  CharacterTemplate,
  'captainHpMultiplier' | 'captainCombatMultiplier' | 'captainBerryGainMultiplier' | 'captainKarmaMultiplier' | 'captainMoraleMultiplier'
>;
