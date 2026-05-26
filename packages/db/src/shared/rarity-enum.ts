import { pgEnum } from 'drizzle-orm/pg-core';

export const rarityEnum = pgEnum('rarity', ['D', 'C', 'B', 'A', 'S', 'SS', 'X']);

export function rarityColumn() {
  return {
    rarity: rarityEnum('rarity').notNull().default('D'),
  };
}
