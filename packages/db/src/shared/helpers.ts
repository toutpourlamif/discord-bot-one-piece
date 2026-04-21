import { text, timestamp } from 'drizzle-orm/pg-core';

export function timestamps() {
  return {
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  };
}

export function imageUrl({ isNullable = true }: { isNullable?: boolean } = {}) {
  const column = text('image_url');
  return {
    imageUrl: isNullable ? column : column.notNull(),
  };
}
