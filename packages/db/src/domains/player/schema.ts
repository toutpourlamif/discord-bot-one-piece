import { sql } from 'drizzle-orm';
import { pgTable, serial, varchar, bigint, integer, boolean } from 'drizzle-orm/pg-core';

import { buildTimestampColumns } from '../../shared/columns/index.js';
import { MAX_CHARACTER_NAME_LENGTH, MAX_CREW_NAME_LENGTH } from '../../shared/constants.js';
import { guild } from '../guild/schema.js';
import { subZoneEnum } from '../navigation/sub-zone-enum.js';
import { ISLAND_ENTRY_SUB_ZONE, type Island } from '../navigation/world/registry.js';
import { zoneEnum } from '../navigation/zone-enum.js';

import { ONBOARDING_STEP_IDS, onboardingStepEnum } from './onboarding-step-enum.js';

export const player = pgTable('player', {
  id: serial('id').primaryKey(),

  discordId: varchar('discord_id', { length: 32 }).notNull().unique(),

  originGuildId: varchar('origin_guild_id', { length: 32 })
    .notNull()
    .references(() => guild.id),

  // Karma interne : -1000 à +1000 (contrôlé côté app)
  karma: integer('karma').notNull().default(0),
  // CrewMorale interne : -100/+100 (contrôlé côté app)
  crewMorale: integer('crew_morale').notNull().default(0),

  name: varchar('name', { length: MAX_CHARACTER_NAME_LENGTH }).notNull(),
  crewName: varchar('crew_name', { length: MAX_CREW_NAME_LENGTH }),
  // drizzle et typescript ont du mal avec les bigint, donc on passe par sql`0`
  bounty: bigint('bounty', { mode: 'bigint' })
    .notNull()
    .default(sql`0`),
  berries: bigint('berries', { mode: 'bigint' })
    .notNull()
    .default(sql`0`),
  ...buildTimestampColumns(),
  lastProcessedBucketId: integer('last_processed_bucket_id').notNull(),
  isAdmin: boolean('is_admin').notNull().default(false),
  currentZone: zoneEnum('current_zone').notNull().default('dawn'),
  currentSubZone: subZoneEnum('current_sub_zone').default(ISLAND_ENTRY_SUB_ZONE.dawn),
  travelTargetZone: zoneEnum('travel_target_zone').$type<Island>(),
  travelStartedBucket: integer('travel_started_bucket'),
  travelEtaBucket: integer('travel_eta_bucket'),
  onboardingStep: onboardingStepEnum('onboarding_step').default(ONBOARDING_STEP_IDS[0]),
});

export type Player = typeof player.$inferSelect;
