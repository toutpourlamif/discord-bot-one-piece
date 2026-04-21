import { pgTable, serial, varchar, timestamp, integer } from 'drizzle-orm/pg-core';

export const player = pgTable('player', {
  id: serial('id').primaryKey(),

  discordId: varchar('discord_id', { length: 32 }).notNull().unique(),

  name: varchar('name', { length: 64 }).notNull(),

  // Karma interne : -1000 à +1000 (contrôlé côté app)
  karma: integer('karma').notNull().default(0),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),

  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
