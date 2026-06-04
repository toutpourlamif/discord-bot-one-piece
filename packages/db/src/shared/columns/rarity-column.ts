import { rarity } from '../enums/rarity.js';

export function buildRarityColumn() {
  return rarity('rarity').notNull().default('D');
}
