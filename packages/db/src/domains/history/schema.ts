import { sql } from 'drizzle-orm';
import { bigserial, index, integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { player } from '../player/schema.js';

export const history = pgTable(
  'history',
  {
    id: bigserial('id', { mode: 'bigint' }).primaryKey(),
    bucketId: integer('bucket_id'),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull().defaultNow(),
    eventType: text('event_type').notNull(),
    actorPlayerId: integer('actor_player_id').references(() => player.id, { onDelete: 'set null' }),
    targetType: text('target_type'),
    targetId: integer('target_id'),
    payload: jsonb('payload')
      .notNull()
      .default(sql`'{}'::jsonb`),
  },
  (table) => [
    index('history_occurred_at_idx').on(table.occurredAt.desc()),
    index('history_event_type_occurred_at_idx').on(table.eventType, table.occurredAt.desc()),
    index('history_actor_player_id_occurred_at_idx')
      .on(table.actorPlayerId, table.occurredAt.desc())
      .where(sql`${table.actorPlayerId} IS NOT NULL`),
    index('history_target_idx')
      .on(table.targetType, table.targetId)
      .where(sql`${table.targetId} IS NOT NULL`),
  ],
);

export type HistoryEntry = typeof history.$inferSelect;
