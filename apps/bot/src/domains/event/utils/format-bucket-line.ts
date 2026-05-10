import { getEndDateOfBucket, getStartDateOfBucket } from '../engine/bucket.js';

function formatBucketTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}h${String(date.getMinutes()).padStart(2, '0')}`;
}

export function formatBucketLine(bucketId: number): string {
  const startDate = getStartDateOfBucket(bucketId);
  const endDate = getEndDateOfBucket(bucketId);

  return `Bucket ${bucketId}, ${formatBucketTime(startDate)} - ${formatBucketTime(endDate)}`;
}
