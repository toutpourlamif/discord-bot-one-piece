import { ForbiddenError } from '../../../discord/errors.js';
import { findCaptainByPlayerId } from '../../crew/service.js';
import { extractCaptainBoosts } from '../../crew/utils/captain-boost.js';

export async function computeBerryReward(playerId: number, baseAmount: bigint): Promise<bigint> {
  const captain = await findCaptainByPlayerId(playerId);
  if (captain === undefined) {
    throw new ForbiddenError(`Un joueur est obligé d'avoir un captain`);
  }
  const { captainBerryGainMultiplier } = extractCaptainBoosts(captain);
  return BigInt(Math.round(Number(baseAmount) * captainBerryGainMultiplier));
}
