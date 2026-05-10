import { SEAS, type Sea, type Zone } from '@one-piece/db';

import type { Rng } from '../types.js';

export function computeNothing() {
  return { effects: [], state: {} };
}

export function isSea(zone: Zone): zone is Sea {
  return (SEAS as ReadonlyArray<Zone>).includes(zone);
}

/** Entier dans [min, max] (bornes incluses) tiré depuis le rng fourni. */
export function getRandomIntBetween(rng: Rng, min: number, max: number): number {
  return Math.floor(rng.next() * (max - min + 1)) + min;
}
