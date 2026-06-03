import { pgEnum } from 'drizzle-orm/pg-core';

export const rarity = pgEnum('rarity', ['D', 'C', 'B', 'A', 'S', 'SS', 'X']);
