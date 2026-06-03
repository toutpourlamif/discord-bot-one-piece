import { rarity } from '../enums/rarity.js';

export function rarityColumn() {
  return rarity('rarity').notNull().default('D');
}
