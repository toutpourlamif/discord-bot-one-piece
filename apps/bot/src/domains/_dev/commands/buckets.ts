import type { Command } from '../../../discord/types.js';
import { getBucketIdFromDate, getEndDateOfBucket, getLatestProcessableBucket, getStartDateOfBucket } from '../../event/engine/bucket.js';
import { formatBucketTime } from '../../event/utils/format-bucket-time.js';

function formatBucketLine(bucketId: number): string {
  const startDate = getStartDateOfBucket(bucketId);
  const endDate = getEndDateOfBucket(bucketId);

  return `Bucket ${bucketId}, ${formatBucketTime(startDate)} - ${formatBucketTime(endDate)}`;
}

export const bucketsCommand: Command = {
  name: 'buckets',
  async handler({ message }) {
    // TODO: remplacer par getNowBucketId quand la PR dédiée sera mergée.
    const nowBucketId = getBucketIdFromDate(new Date());
    const latestProcessableBucketId = getLatestProcessableBucket();

    await message.reply(
      ['Now:', formatBucketLine(nowBucketId), 'LatestProcessable:', formatBucketLine(latestProcessableBucketId)].join('\n'),
    );
  },
};
