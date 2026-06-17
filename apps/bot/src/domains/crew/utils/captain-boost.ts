import type { CaptainBoosts } from '@one-piece/db';

import type { Character } from '../../character/types.js';

export function extractCaptainBoosts(captain: Character): CaptainBoosts {
  return {
    captainCombatMultiplier: captain.captainCombatMultiplier,
    captainHpMultiplier: captain.captainHpMultiplier,
    captainBerryGainMultiplier: captain.captainBerryGainMultiplier,
    captainKarmaMultiplier: captain.captainKarmaMultiplier,
    captainMoraleMultiplier: captain.captainMoraleMultiplier,
  };
}
