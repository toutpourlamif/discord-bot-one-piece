import { sql } from 'drizzle-orm';
import { bigint, bigserial, boolean, integer, jsonb, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

import { player } from '../../player/schema.js';

export const eventInstance = pgTable(
  'event_instance',
  {
    id: bigserial('id', { mode: 'bigint' }).primaryKey(),
    playerId: integer('player_id')
      .notNull()
      .references(() => player.id, { onDelete: 'cascade' }),
    eventKey: text('event_key').notNull(),
    isInteractive: boolean('is_interactive').notNull(),
    bucketId: bigint('bucket_id', { mode: 'bigint' }).notNull(),
    state: jsonb('state')
      .notNull()
      .default(sql`'{}'::jsonb`),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('event_instance_player_event_key_bucket_uniq').on(table.playerId, table.eventKey, table.bucketId)],
);

export type EventInstance = typeof eventInstance.$inferSelect;
