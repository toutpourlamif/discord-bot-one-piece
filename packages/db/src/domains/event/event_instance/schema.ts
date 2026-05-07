import { sql } from 'drizzle-orm';
import { bigserial, boolean, integer, jsonb, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

import type { JSONFromSQL } from '../../../shared/types.js';
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
    bucketId: integer('bucket_id').notNull(),
    state: jsonb('state')
      .$type<JSONFromSQL>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    // TODO: ajouter `encounter_id` (bigint nullable) pour relier les events cross-player (cf docs/domains/event/cross-player.md)
  },
  (table) => [uniqueIndex('event_instance_player_event_key_bucket_uniq').on(table.playerId, table.eventKey, table.bucketId)],
);

export type EventInstance = typeof eventInstance.$inferSelect;
