import * as playerRepository from '../repository.js';

export async function sell(playerId: number, amount: bigint): Promise<bigint> {
  return playerRepository.creditBerry(playerId, amount);
}
