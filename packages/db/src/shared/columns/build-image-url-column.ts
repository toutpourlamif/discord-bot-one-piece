import { text } from 'drizzle-orm/pg-core';

export function buildImageUrlColumn({ isNullable = true }: { isNullable?: boolean } = {}) {
  const column = text('image_url');
  return {
    imageUrl: isNullable ? column : column.notNull(),
  };
}
