import * as economyRepository from '../repository.js';

export async function buy(playerId: number, amount: bigint): Promise<bigint> {
  return economyRepository.debitBerry(playerId, amount);
}
