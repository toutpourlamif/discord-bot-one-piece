import type { CaptainBoosts } from '@one-piece/db';

import type { CharacterRow } from '../../character/types.js';

export function extractCaptainBoosts(captain: CharacterRow): CaptainBoosts {
  return {
    captainCombatMultiplier: captain.captainCombatMultiplier,
    captainHpMultiplier: captain.captainHpMultiplier,
    captainBerryGainMultiplier: captain.captainBerryGainMultiplier,
    captainKarmaMultiplier: captain.captainKarmaMultiplier,
    captainMoraleMultiplier: captain.captainMoraleMultiplier,
  };
}
