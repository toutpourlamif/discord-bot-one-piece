import { sql } from 'drizzle-orm';
import { index, pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';

import { imageUrl } from '../../../shared/columns/imageUrlColumn.js';
import { rarityColumn } from '../../../shared/columns/rarityColumn.js';
import { timestamps } from '../../../shared/columns/timestampColumns.js';

import type { ResourceName } from './data.js';

export const resourceTemplate = pgTable(
  'resource_template',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 128 }).$type<ResourceName>().notNull().unique(),
    rarity: rarityColumn(),

    ...imageUrl(),
    description: text('description'),
    ...timestamps(),
  },
  (table) => [index('resource_template_name_trgm_idx').using('gin', sql`${table.name} gin_trgm_ops`)],
);

export type ResourceTemplateInsert = typeof resourceTemplate.$inferInsert;
export type ResourceTemplate = typeof resourceTemplate.$inferSelect;
