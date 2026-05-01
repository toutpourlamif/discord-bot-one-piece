import * as playerRepository from '../economy/repository.js';

import { InsufficientFundsError } from './errors.js';

// TODO: renommer la fonction quand besoin métier
export async function buy(playerId: number, amount: bigint): Promise<bigint> {
  const newBalance = await playerRepository.debitBerry(playerId, amount);
  if (!newBalance) throw new InsufficientFundsError();
  return newBalance;
}

// TODO: pareil qu'en haut, renommer la fonction quand besoin métier
export async function sell(playerId: number, amount: bigint): Promise<bigint> {
  return playerRepository.creditBerry(playerId, amount);
}
