import { sql } from 'drizzle-orm';
import { bigint, pgTable, serial, varchar } from 'drizzle-orm/pg-core';

import { timestamps } from './helpers.js';

export const player = pgTable('player', {
  id: serial('id').primaryKey(),
  discordId: varchar('discord_id', { length: 32 }).notNull().unique(),
  name: varchar('name', { length: 64 }).notNull(),
  // drizzle et typescript ont du mal avec les bigint, donc on passe par sql`0`
  bounty: bigint('bounty', { mode: 'bigint' })
    .notNull()
    .default(sql`0`),
  ...timestamps(),
});
