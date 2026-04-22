import { pgTable, text } from 'drizzle-orm/pg-core';

import { timestamps } from '../../../shared/helpers.js';

export const resourceTemplate = pgTable('resource_template', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  imageUrl: text('image_url').notNull(),
  description: text('description').notNull(),
  ...timestamps(),
});

export type ResourceTemplate = typeof resourceTemplate.$inferSelect;
