import { pgTable, text, varchar, serial } from 'drizzle-orm/pg-core';

import { imageUrl, timestamps } from '../../../shared/helpers.js';

export const resourceTemplate = pgTable('resource_template', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 128 }).notNull(),
  ...imageUrl(),
  description: text('description'),
  ...timestamps(),
});

export type ResourceTemplate = typeof resourceTemplate.$inferSelect;
