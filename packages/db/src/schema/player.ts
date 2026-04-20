import { pgTable, serial, varchar, timestamp, bigint } from 'drizzle-orm/pg-core';

export const player = pgTable('player', {
  id: serial('id').primaryKey(),
  discordId: varchar('discord_id', { length: 32 }).notNull().unique(),
  name: varchar('name', { length: 64 }).notNull(),
  bounty: bigint({ mode: 'bigint' }).notNull().default(0n), // en Berrys
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
