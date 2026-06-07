import { ForbiddenError } from '../../../discord/errors.js';
import { findCaptainByPlayerId } from '../../crew/service.js';
import { extractCaptainBoosts } from '../../crew/utils/captain-boost.js';
import * as playerRepository from '../repository.js';

// TODO: renommer la fonction quand besoin métier
export async function buy(playerId: number, amount: bigint): Promise<bigint> {
  return playerRepository.debitBerry(playerId, amount);
}

// TODO: pareil qu'en haut, renommer la fonction quand besoin métier
export async function sell(playerId: number, amount: bigint): Promise<bigint> {
  return playerRepository.creditBerry(playerId, amount);
}

type CreditBerryOptions = {
  considerCaptainBoosts?: boolean;
};

type CreditBerryParams = {
  playerId: number;
  amount: bigint;
  options?: CreditBerryOptions;
};

export async function creditBerry({ playerId, amount, options }: CreditBerryParams): Promise<bigint> {
  let finalAmount = amount;

  if (options?.considerCaptainBoosts) {
    finalAmount = await computeBerryReward(playerId, amount);
  }

  return playerRepository.creditBerry(playerId, finalAmount);
}

export async function computeBerryReward(playerId: number, baseAmount: bigint): Promise<bigint> {
  const captain = await findCaptainByPlayerId(playerId);
  if (captain === undefined) {
    throw new ForbiddenError(`Un joueur est obligé d'avoir un captain`);
  }
  const { captainBerryGainMultiplier } = extractCaptainBoosts(captain);
  return BigInt(Math.round(Number(baseAmount) * captainBerryGainMultiplier));
}
