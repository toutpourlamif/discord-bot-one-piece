import { text } from 'drizzle-orm/pg-core';

export function buildPathColumn({ isNullable = true }: { isNullable?: boolean } = {}) {
  const column = text('path');
  return {
    path: isNullable ? column : column.notNull(),
  };
}
