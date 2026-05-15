import { sql } from 'drizzle-orm';
import { bigserial, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

import type { JSONFromSQL } from '../../shared/types.js';
import { player } from '../player/schema.js';

export const history = pgTable(
  'history',
  {
    id: bigserial('id', { mode: 'bigint' }).primaryKey(),
    bucketId: integer('bucket_id'),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull().defaultNow(),
    kind: text('kind').notNull(),
    actorPlayerId: integer('actor_player_id').references(() => player.id, { onDelete: 'set null' }),
    targetType: text('target_type'),
    targetId: integer('target_id'),
    payload: jsonb('payload')
      .$type<JSONFromSQL>()
      .notNull()
      .default(sql`'{}'::jsonb`),
  },
  (table) => [
    index('history_occurred_at_idx').on(table.occurredAt.desc()),
    index('history_kind_occurred_at_idx').on(table.kind, table.occurredAt.desc()),
    index('history_actor_player_id_occurred_at_idx')
      .on(table.actorPlayerId, table.occurredAt.desc())
      .where(sql`${table.actorPlayerId} IS NOT NULL`),
    index('history_target_idx')
      .on(table.targetType, table.targetId)
      .where(sql`${table.targetId} IS NOT NULL`),
    uniqueIndex('history_actor_kind_bucket_uniq')
      .on(table.actorPlayerId, table.kind, table.bucketId)
      .where(sql`${table.actorPlayerId} IS NOT NULL AND ${table.bucketId} IS NOT NULL`),
  ],
);

export type HistoryEntry = typeof history.$inferSelect;
