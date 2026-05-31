import * as playerRepository from '../economy/repository.js';

import { computeBerryReward } from './utils/compute-berry-reward.js';

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
