import { integer } from 'drizzle-orm/gel-core';
import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';

export const player = pgTable('player', {
  id: serial('id').primaryKey(),
  discordId: varchar('discord_id', { length: 32 }).notNull().unique(),
  name: varchar('name', { length: 64 }).notNull(),
  bounty: integer('bounty').notNull().default(0), // en Berrys
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
