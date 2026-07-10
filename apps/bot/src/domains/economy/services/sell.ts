import * as economyRepository from '../repository.js';

export async function sell(playerId: number, amount: bigint): Promise<bigint> {
  return economyRepository.creditBerry(playerId, amount);
}
