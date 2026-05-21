import type { CaptainBoosts, CharacterCombatStats } from '@one-piece/db';

import type { CharacterRow, CharacterTemplateWithDevilFruit } from '../types.js';

export function getEffectiveStats(character: CharacterRow | CharacterTemplateWithDevilFruit, boosts?: CaptainBoosts): CharacterCombatStats {
  return {
    combat: Math.round((character.combat + (character.devilFruit?.combatBonus ?? 0)) * (boosts?.captainCombatMultiplier ?? 1)),
    hp: Math.round((character.hp + (character.devilFruit?.hpBonus ?? 0)) * (boosts?.captainHpMultiplier ?? 1)),
  };
}
