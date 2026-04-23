import { integer, pgTable, serial, varchar } from 'drizzle-orm/pg-core';

import { timestamps } from '../../shared/helpers.js';
import { player } from '../player/schema.js';

export const ship = pgTable('ship', {
  id: serial('id').primaryKey(),

  playerId: integer('player_id')
    .notNull()
    .unique()
    .references(() => player.id, { onDelete: 'cascade' }),

  name: varchar('name', { length: 128 }).notNull(),

  hp: integer('hp').notNull().default(100),

  hullLevel: integer('hull_level').notNull().default(1),
  sailLevel: integer('sail_level').notNull().default(1),
  decksLevel: integer('decks_level').notNull().default(1),
  cabinsLevel: integer('cabins_level').notNull().default(1),
  cargoLevel: integer('cargo_level').notNull().default(1),

  ...timestamps(),
});

export type Ship = typeof ship.$inferSelect;
