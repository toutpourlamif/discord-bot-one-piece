import { pgTable, varchar } from 'drizzle-orm/pg-core';

import { timestamps } from '../../shared/helpers.js';

import { DEFAULT_GUILD_LANGUAGE, DEFAULT_GUILD_PREFIX, MAX_GUILD_PREFIX_LENGTH } from './constants.js';

export const guild = pgTable('guild', {
  id: varchar('id', { length: 32 }).primaryKey(),

  language: varchar('language', { length: 8 }).notNull().default(DEFAULT_GUILD_LANGUAGE),
  prefix: varchar('prefix', { length: MAX_GUILD_PREFIX_LENGTH }).notNull().default(DEFAULT_GUILD_PREFIX),

  ...timestamps(),
});

export type Guild = typeof guild.$inferSelect;
