import { pgTable, varchar } from 'drizzle-orm/pg-core';

import { timestamps } from '../../shared/helpers.js';

import { MAX_GUILD_PREFIX_LENGTH } from './constants.js';

const DEFAULT_GUILD_LANGUAGE = 'fr';
const DEFAULT_GUILD_PREFIX = '!';

export const guild = pgTable('guild', {
  id: varchar('id', { length: 32 }).primaryKey(),

  language: varchar('language', { length: 8 }).notNull().default(DEFAULT_GUILD_LANGUAGE),
  prefix: varchar('prefix', { length: MAX_GUILD_PREFIX_LENGTH }).notNull().default(DEFAULT_GUILD_PREFIX),

  ...timestamps(),
});

export type Guild = typeof guild.$inferSelect;
