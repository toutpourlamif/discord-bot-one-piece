import * as playerRepository from '../economy/repository.js';

import { InsufficientFundsError } from './errors.js';

export async function buy(playerId: number, amount: bigint): Promise<void> {
  const success = await playerRepository.debitBerry(playerId, amount);
  if (!success) throw new InsufficientFundsError();
}

export async function sell(playerId: number, amount: bigint): Promise<void> {
  await playerRepository.creditBerry(playerId, amount);
}
