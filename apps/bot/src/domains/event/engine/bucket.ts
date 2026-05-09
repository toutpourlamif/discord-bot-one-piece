export const BUCKET_DURATION_SEC = 15 * 60;

export function getBucketIdFromDate(date: Date): number {
  return Math.floor(date.getTime() / 1000 / BUCKET_DURATION_SEC);
}

export function getNowBucketId(): number {
  return getBucketIdFromDate(new Date());
}

export function getStartDateOfBucket(bucketId: number): Date {
  return new Date(bucketId * BUCKET_DURATION_SEC * 1000);
}

export function getEndDateOfBucket(bucketId: number): Date {
  return new Date((bucketId + 1) * BUCKET_DURATION_SEC * 1000);
}

/** Dernier bucket complet (= courant - 1). Le bucket en cours n'est pas traité tant qu'il n'est pas terminé. */
export function getLatestProcessableBucket(): number {
  return getNowBucketId() - 1;
}
