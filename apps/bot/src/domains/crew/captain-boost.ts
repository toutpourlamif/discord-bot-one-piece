import type { CaptainBoosts } from '@one-piece/db';

import * as crewRepository from './repository.js';

export async function getCaptainBoosts(playerId: number): Promise<CaptainBoosts> {
  const captain = await crewRepository.findCaptainByPlayerId(playerId);

  if (!captain) {
    return {
      captainCombatMultiplier: 1,
      captainBerryGainMultiplier: 1,
      captainHpMultiplier: 1,
      captainKarmaMultiplier: 1,
      captainMoraleMultiplier: 1,
    };
  }
  return captain;
}
