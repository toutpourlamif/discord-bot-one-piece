import * as playerRepository from '../economy/repository.js';

import { InsufficientFundsError } from './errors.js';
// TODO: renommer la fonction quand besoin métier
export async function buy(playerId: number, amount: bigint): Promise<void> {
  const success = await playerRepository.debitBerry(playerId, amount);
  if (!success) throw new InsufficientFundsError();
}
// TODO: pareil qu'en haut, renommer la fonction quand besoin métier
export async function sell(playerId: number, amount: bigint): Promise<void> {
  await playerRepository.creditBerry(playerId, amount);
}
