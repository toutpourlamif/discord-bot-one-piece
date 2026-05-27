import { findCaptainByPlayerId } from '../../crew/service.js';
import { extractCaptainBoosts } from '../../crew/utils/captain-boost.js';

export async function computeBerryReward(playerId: number, baseAmount: bigint): Promise<bigint> {
  const captain = await findCaptainByPlayerId(playerId);
  if (captain === undefined) return baseAmount;
  const { captainBerryGainMultiplier } = extractCaptainBoosts(captain);
  return BigInt(Math.round(Number(baseAmount) * captainBerryGainMultiplier));
}
