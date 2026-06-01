import type { Command } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/build-op-embed.js';
import { getEndDateOfBucket, getLatestProcessableBucket, getNowBucketId, getStartDateOfBucket } from '../../event/engine/bucket.js';
import { formatBucketTime } from '../../event/utils/format-bucket-time.js';

export const bucketsCommand: Command = {
  name: 'buckets',
  async handler({ message }) {
    const nowBucketId = getNowBucketId();
    const latestProcessableBucketId = getLatestProcessableBucket();

    const embed = buildOpEmbed('info')
      .setTitle('Buckets')
      .setDescription(`Now: ${formatBucketLine(nowBucketId)}, \n\n Latest processable: ${formatBucketLine(latestProcessableBucketId)}`);

    await message.reply({ embeds: [embed] });
  },
};

function formatBucketLine(bucketId: number): string {
  const startDate = getStartDateOfBucket(bucketId);
  const endDate = getEndDateOfBucket(bucketId);
  //TODO: ajouter l'util wrapInBackticks quand dispo autour du bucketId a la places des etoiles
  return `**${bucketId}**, \n${formatBucketTime(startDate)} - ${formatBucketTime(endDate)}`;
}
