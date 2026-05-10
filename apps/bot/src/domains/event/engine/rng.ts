import type { EventGenerator, GeneratorContext } from '../types.js';

/**
 * Un générateur de nombres pseudo-aléatoires (PRNG) qui produit des nombres dans [0, 1).
 */
export type Rng = { next: () => number };

/**
 * Hache une chaîne de caractères en un entier 32 bits via un hash polynomial.
 *
 * @param s - La chaîne à hacher.
 * @returns Un entier 32 bits correspondant au hash de la chaîne.
 */
export function hashString(s: string): number {
  let hash = 0;
  for (const char of s) {
    hash = hash * 31 + char.charCodeAt(0);
  }
  return hash;
}

/**
 * Dérive une graine déterministe à partir d'un identifiant de bucket et d'un identifiant de zone.
 * Deux appels avec les mêmes arguments produiront toujours la même graine.
 *
 * @param bucketId - L'identifiant du bucket.
 * @param zoneId - L'identifiant textuel de la zone.
 * @returns Un entier 32 bits utilisable comme graine.
 */
export function seedFromBucketAndZone(bucketId: number, zoneId: string): number {
  return hashString(zoneId) ^ (bucketId * 2654435761);
}

/**
 * Dérive une graine déterministe à partir d'un identifiant de bucket et d'un identifiant de joueur.
 * Deux appels avec les mêmes arguments produiront toujours la même graine.
 *
 * @param bucketId - L'identifiant du bucket.
 * @param playerId - L'identifiant du joueur.
 * @returns Un entier 32 bits utilisable comme graine.
 */
export function seedFromBucketAndPlayer(bucketId: number, playerId: number): number {
  return playerId ^ (bucketId * 2654435761);
}

/**
 * Crée un PRNG à graine fixe basé sur un algorithme inspiré de Mulberry32.
 * Le générateur est stateful — chaque appel à `next()` fait avancer l'état interne.
 *
 * @param seed - La valeur de graine initiale.
 * @returns Une instance de {@link Rng} dont la méthode `next()` retourne un flottant dans [0, 1).
 *
 * @example
 * const rng = createRng(seedFromBucketAndPlayer(1, 42));
 * const valeur = rng.next(); // ex: 0.7281...
 */
export function createRng(seed: number): Rng {
  return {
    next() {
      let t = (seed += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
  };
}

/** Crée le RNG d'un générateur pour un bucket donné, en suivant son `seedScope` (zone ou player). */
export function createRngForGenerator(gen: EventGenerator, ctx: GeneratorContext): Rng {
  const seed =
    gen.seedScope === 'zone' ? seedFromBucketAndZone(ctx.bucketId, ctx.zone) : seedFromBucketAndPlayer(ctx.bucketId, ctx.player.id);
  return createRng(seed);
}

/** Tirage déterministe d'un élément à partir d'une graine. Équivalent seeded de `lodash.sample`. */
export function pickRandomWithSeed<T>(seed: number, items: Array<T>): T {
  if (items.length === 0) throw new Error('pickRandomWithSeed: items is empty');
  return items[Math.floor(createRng(seed).next() * items.length)]!;
}
