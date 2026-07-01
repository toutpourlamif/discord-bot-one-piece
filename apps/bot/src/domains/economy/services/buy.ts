import * as playerRepository from '../repository.js';

export async function buy(playerId: number, amount: bigint): Promise<bigint> {
  return playerRepository.debitBerry(playerId, amount);
}
