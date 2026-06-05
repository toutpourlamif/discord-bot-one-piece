import { rarity } from '../enums/rarity-enum.js';

export function buildRarityColumn() {
  return {
    rarity: rarity('rarity').notNull().default('D'),
  };
}
