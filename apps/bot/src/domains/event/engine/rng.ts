export type Rng = { next: () => number };

export function hashString(s: string): number {
  let hash = 0;
  for (const char of s) {
    hash = hash * 31 + char.charCodeAt(0);
  }
  return hash;
}

export function seedFromBucketAndZone(bucketId: number, zoneId: string): number {
  return hashString(zoneId) ^ (bucketId * 2654435761);
}
export function seedFromBucketAndPlayer(bucketId: number, playerId: number): number {
  return playerId ^ (bucketId * 2654435761);
}
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
