import { NotFoundError } from '../../../discord/errors.js';
import type { Command } from '../../../discord/types.js';
import { buildOpEmbed, getTargetUser, parseIntegerArg } from '../../../discord/utils/index.js';
import * as playerRepository from '../../player/repository.js';

export const setBucketCommand: Command = {
  name: 'setbucket',
  async handler({ message, args }) {
    const target = getTargetUser(message);
    const queryArgs = message.mentions.users.first() ? args.slice(1) : args;
    const bucketId = parseIntegerArg(queryArgs[0]);
    const player = await playerRepository.findByDiscordId(target.id);
    if (player === undefined) {
      throw new NotFoundError('Le joueur est introuvable.');
    }
    const oldBucket = player.lastProcessedBucketId;
    await playerRepository.setLastProcessedBucketId(player.id, bucketId);
    await message.reply({ embeds: [buildOpEmbed().setDescription(`${player.name} : bucket ${oldBucket} → ${bucketId}`)] });
  },
};
