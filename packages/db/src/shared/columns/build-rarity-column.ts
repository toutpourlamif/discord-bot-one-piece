import { rarityEnum } from '../enums/rarity-enum.js';

export function buildRarityColumn() {
  return {
    rarity: rarityEnum('rarity').notNull().default('D'),
  };
}
