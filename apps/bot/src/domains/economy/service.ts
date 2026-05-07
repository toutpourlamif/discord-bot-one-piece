import * as playerRepository from '../economy/repository.js';

// TODO: renommer la fonction quand besoin métier
export async function buy(playerId: number, amount: bigint): Promise<bigint> {
  return playerRepository.debitBerry(playerId, amount);
}

// TODO: pareil qu'en haut, renommer la fonction quand besoin métier
export async function sell(playerId: number, amount: bigint): Promise<bigint> {
  return playerRepository.creditBerry(playerId, amount);
}
