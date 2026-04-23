import { pgTable, text, varchar, serial } from 'drizzle-orm/pg-core';

import { imageUrl, timestamps } from '../../../shared/helpers.js';

export const resourceTemplate = pgTable('resource_template', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 128 }).notNull().unique(),
  ...imageUrl(),
  description: text('description'),
  ...timestamps(),
});

export type ResourceTemplateInsert = typeof resourceTemplate.$inferInsert;
export type ResourceTemplate = typeof resourceTemplate.$inferSelect;
