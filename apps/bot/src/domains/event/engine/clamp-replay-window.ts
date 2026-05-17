import { inBuckets } from './bucket.js';

const MAX_BUCKETS_TO_REPLAY = inBuckets('48h');

/**
 * Borne le bucket de départ à la fenêtre de replay (48h max).
 * Si le joueur est AFK depuis plus longtemps, les buckets en dehors de la fenêtre sont silencieusement perdus.
 */
export function clampToReplayWindow(fromBucket: number, latestProcessableBucket: number): number {
  return Math.max(fromBucket, latestProcessableBucket - MAX_BUCKETS_TO_REPLAY + 1);
}
