import { ValidationError } from '../../../discord/errors.js';
import type { Command } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/build-op-embed.js';
import { parseIntegerArg } from '../../../discord/utils/parse-integer-arg.js';
import { resolveTargetPlayer } from '../../player/index.js';
import * as playerRepository from '../../player/repository.js';

export const setEtaCommand: Command = {
  names: { fr: 'seteta', en: 'seteta' },
  async handler(ctx) {
    const { targetPlayer, rest } = await resolveTargetPlayer(ctx);
    const { travelTargetZone } = targetPlayer;
    const parsedBucket = parseIntegerArg(rest[0]);

    if (!travelTargetZone) {
      throw new ValidationError(`Usage: !seteta <@user> <bucket(integer)> \n\n Il faut un voyage en cours!`);
    }

    const currentEtaBucket = targetPlayer.travelEtaBucket;

    if (currentEtaBucket === null) {
      throw new ValidationError('Aucun ETA en cours.');
    }

    if (parsedBucket < currentEtaBucket) {
      throw new ValidationError(`Tu ne peux pas arriver dans le passé
(la machine à remonter le temps n'existe pas encore.)`);
    }

    await playerRepository.setTravelEtaBucket(targetPlayer.id, parsedBucket);

    const embed = buildOpEmbed('success').setTitle('Eta').setDescription(`Eta déplacé au bucket ${parsedBucket}`);

    await ctx.message.reply({ embeds: [embed] });
  },
};
