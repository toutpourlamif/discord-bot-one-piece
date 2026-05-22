import type { CharacterCombatStats } from '@one-piece/db';

import type { CharacterRow, CharacterTemplateWithDevilFruit } from '../types.js';

export function getEffectiveStats(character: CharacterRow | CharacterTemplateWithDevilFruit): CharacterCombatStats {
  return {
    combat: character.combat + (character.devilFruit?.combatBonus ?? 0),
    hp: character.hp + (character.devilFruit?.hpBonus ?? 0),
  };
}
