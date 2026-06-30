import type { CaptainBoosts, CharacterCombatStats } from '@one-piece/db';

import type { Character } from '../types.js';

export function getEffectiveStats(
  character: Pick<Character, 'combat' | 'hp' | 'devilFruit'>,
  captainBoosts?: CaptainBoosts,
): CharacterCombatStats {
  const baseCombat = character.combat;
  const fruitCombatBonus = character.devilFruit?.combatBonus ?? 0;
  const combatMultiplier = captainBoosts?.captainCombatMultiplier ?? 1;

  const baseHp = character.hp;
  const fruitHpBonus = character.devilFruit?.hpBonus ?? 0;
  const hpMultiplier = captainBoosts?.captainHpMultiplier ?? 1;

  return {
    combat: Math.round((baseCombat + fruitCombatBonus) * combatMultiplier),
    hp: Math.round((baseHp + fruitHpBonus) * hpMultiplier),
  };
}
