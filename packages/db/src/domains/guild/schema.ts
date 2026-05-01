import { pgTable, varchar } from 'drizzle-orm/pg-core';

import { timestamps } from '../../shared/helpers.js';

export const guild = pgTable('guild', {
  id: varchar('id', { length: 32 }).primaryKey(),

  language: varchar('language', { length: 8 }).notNull().default('fr'),
  prefix: varchar('prefix', { length: 8 }).notNull().default('!'),

  ...timestamps(),
});

export type Guild = typeof guild.$inferSelect;
