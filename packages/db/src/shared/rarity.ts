import { pgEnum } from 'drizzle-orm/pg-core';

export const rarity = pgEnum('rarity', ['COMMON', 'RARE', 'VERY_RARE', 'LEGENDARY']);
