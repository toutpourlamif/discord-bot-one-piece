import { ValidationError } from '../../../discord/errors.js';
import type { Command } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/build-op-embed.js';
import { parseIntegerArg } from '../../../discord/utils/parse-integer-arg.js';
import { resolveTargetPlayer } from '../../player/index.js';
import * as playerRepository from '../../player/repository.js';

export const setEtaCommand: Command = {
  name: ['set-eta', 'seteta'],
  async handler(ctx) {
    const { targetPlayer, rest } = await resolveTargetPlayer(ctx);
    const [bucketNumber] = rest;
    const { travelTargetZone } = targetPlayer;

    const parsedBucket = parseIntegerArg(bucketNumber);

    if (!travelTargetZone) {
      throw new ValidationError(`Usage: !seteta <@user> <bucket(integer)> \n\n Il faut un voyage en cours!`);
    }

    await playerRepository.setTravelEtaBucket(targetPlayer.id, parsedBucket);

    const embed = buildOpEmbed('info').setTitle('Eta').setDescription(`Eta déplacé au bucket ${parsedBucket}`);

    await ctx.message.reply({ embeds: [embed] });
  },
};
