import type { Command } from '../../../discord/types.js';
import { buildOpEmbed, parseIntegerArg } from '../../../discord/utils/index.js';
import { resolveTargetPlayer } from '../../player/index.js';
import * as playerRepository from '../../player/repository.js';

export const setBucketCommand: Command = {
  names: { fr: 'setbucket', en: 'setbucket'},
  aliases: { fr: ['sb'], en: ['sb']},
  async handler(ctx) {
    const { targetPlayer, rest } = await resolveTargetPlayer(ctx);
    const bucketId = parseIntegerArg(rest[0]);
    const oldBucket = targetPlayer.lastProcessedBucketId;
    await playerRepository.setLastProcessedBucketId(targetPlayer.id, bucketId);
    await ctx.message.reply({
      embeds: [buildOpEmbed('success').setDescription(`🪣  Bucket mis à jour pour ${targetPlayer.name}  \n${oldBucket} → ${bucketId}`)],
    });
  },
};
