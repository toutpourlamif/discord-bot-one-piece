import type { Command } from '../../../discord/types.js';
import { getBucketIdFromDate, getLatestProcessableBucket } from '../../event/engine/bucket.js';
import { formatBucketLine } from '../../event/utils/format-bucket-line.js';

export const bucketsCommand: Command = {
  name: 'buckets',
  async handler({ message }) {
    const nowBucketId = getBucketIdFromDate(new Date());
    const latestProcessableBucketId = getLatestProcessableBucket();

    await message.reply(
      ['Now:', formatBucketLine(nowBucketId), 'LatestProcessable:', formatBucketLine(latestProcessableBucketId)].join('\n'),
    );
  },
};
