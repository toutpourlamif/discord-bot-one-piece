import { pgTable, text, varchar, serial } from 'drizzle-orm/pg-core';

import { timestamps } from '../../../shared/helpers.js';

export const resourceTemplate = pgTable('resource_template', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
  imageUrl: text('image_url'),
  description: text('description'),
  ...timestamps(),
});

export type ResourceTemplate = typeof resourceTemplate.$inferSelect;
