export const BUCKET_DURATION_SEC = 15 * 60;

export function bucketIdFromTimestamp(date: Date): number {
  return Math.floor(date.getTime() / 1000 / BUCKET_DURATION_SEC);
}

export function startOfBucket(bucketId: number): Date {
  return new Date(bucketId * BUCKET_DURATION_SEC * 1000);
}

export function endOfBucket(bucketId: number): Date {
  return new Date((bucketId + 1) * BUCKET_DURATION_SEC * 1000);
}
