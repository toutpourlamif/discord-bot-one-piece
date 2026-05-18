import type { CharacterRow } from '../types.js';

type CharacterStatsSource = Pick<CharacterRow, 'combat' | 'devilFruit' | 'hp'>;

export function getEffectiveStats(character: CharacterStatsSource): { combat: number; hp: number } {
  return {
    combat: character.combat + (character.devilFruit?.combatBonus ?? 0),
    hp: character.hp + (character.devilFruit?.hpBonus ?? 0),
  };
}
