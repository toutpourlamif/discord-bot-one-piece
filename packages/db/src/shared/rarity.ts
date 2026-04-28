import { pgEnum } from 'drizzle-orm/pg-core';

export const rarity = pgEnum('rarity', ['COMMUN', 'RARE', 'TRES_RARE', 'LEGENDAIRE']);
