import { sql } from 'drizzle-orm';
import { pgTable, serial, varchar, bigint, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

import { MAX_CHARACTER_NAME_LENGTH } from '../../shared/constants.js';
import { timestamps } from '../../shared/helpers.js';

export const player = pgTable('player', {
  id: serial('id').primaryKey(),

  discordId: varchar('discord_id', { length: 32 }).notNull().unique(),

  // Karma interne : -1000 à +1000 (contrôlé côté app)
  karma: integer('karma').notNull().default(0),

  name: varchar('name', { length: MAX_CHARACTER_NAME_LENGTH }).notNull(),
  // drizzle et typescript ont du mal avec les bigint, donc on passe par sql`0`
  bounty: bigint('bounty', { mode: 'bigint' })
    .notNull()
    .default(sql`0`),
  berries: bigint('berries', { mode: 'bigint' })
    .notNull()
    .default(sql`0`),
  ...timestamps(),
  isAdmin: boolean('is_admin').notNull().default(false),
  last_recap_at: timestamp('last_recap_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Player = typeof player.$inferSelect;
