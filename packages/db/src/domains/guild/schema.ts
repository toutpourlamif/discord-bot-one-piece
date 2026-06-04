import { pgTable, varchar } from 'drizzle-orm/pg-core';

import { buildTimestampColumns } from '../../shared/columns/timestamp-columns.js';

import {
  DEFAULT_GUILD_LANGUAGE,
  DEFAULT_GUILD_NAME,
  DEFAULT_GUILD_PREFIX,
  MAX_GUILD_NAME_LENGTH,
  MAX_GUILD_PREFIX_LENGTH,
} from './constants.js';
import { languageEnum } from './language-enum.js';

export const guild = pgTable('guild', {
  id: varchar('id', { length: 32 }).primaryKey(),

  name: varchar('name', { length: MAX_GUILD_NAME_LENGTH }).notNull().default(DEFAULT_GUILD_NAME),
  language: languageEnum('language').notNull().default(DEFAULT_GUILD_LANGUAGE),
  prefix: varchar('prefix', { length: MAX_GUILD_PREFIX_LENGTH }).notNull().default(DEFAULT_GUILD_PREFIX),

  ...buildTimestampColumns(),
});

export type Guild = typeof guild.$inferSelect;
