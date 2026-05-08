import { BUCKET_DURATION_SEC } from './bucket.js';

const MAX_HOURS_TO_REPLAY = 48;
const MAX_BUCKETS_TO_REPLAY = (MAX_HOURS_TO_REPLAY * 60 * 60) / BUCKET_DURATION_SEC;

/**
 * Borne le bucket de départ à la fenêtre de replay MAX_HOURS_TO_REPLAY (48h max).
 * Si le joueur est AFK depuis plus longtemps, les buckets en dehors de la fenêtre sont silencieusement perdus.
 */
export function clampToReplayWindow(fromBucket: number, latestProcessableBucket: number): number {
  return Math.max(fromBucket, latestProcessableBucket - MAX_BUCKETS_TO_REPLAY + 1);
}
