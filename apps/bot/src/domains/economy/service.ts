import { debitBerry, creditBerry } from '../player/repository.js';

export class InsufficientFundsError extends Error {
  constructor() {
    super('Fonds insuffisants.');
  }
}

export async function buy(playerId: number, amount: bigint): Promise<void> {
  const success = await debitBerry(playerId, amount);
  if (!success) throw new InsufficientFundsError();
}

export async function sell(playerId: number, amount: bigint): Promise<void> {
  await creditBerry(playerId, amount);
}
