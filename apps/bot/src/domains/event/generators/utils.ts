import type { Rng } from '../types.js';

export function computeNothing() {
  return { effects: [], state: {} };
}

export const noProbability = () => 0;

/** Entier dans [min, max] (bornes incluses) tiré depuis le rng fourni. */
export function getRandomIntBetween(rng: Rng, min: number, max: number): number {
  return Math.floor(rng.next() * (max - min + 1)) + min;
}
