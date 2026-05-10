import { db } from '@one-piece/db';

import { NotFoundError, ValidationError } from '../../../discord/errors.js';
import type { Command } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/build-op-embed.js';
import { getNowBucketId } from '../../event/engine/bucket.js';
import { buildGeneratorContext, fetchGeneratorContextData } from '../../event/engine/context-builders.js';
import { recordInteractive, recordPassive } from '../../event/engine/record-event.js';
import { createRngForGenerator } from '../../event/engine/rng.js';
import { allGenerators } from '../../event/generators/registry.js';
import { resolveTargetPlayer } from '../../player/index.js';
import * as playerRepository from '../../player/repository.js';

export const forceEventCommand: Command = {
  name: ['forceEvent', 'force-event'],
  async handler(ctx) {
    const { targetPlayer, rest } = await resolveTargetPlayer(ctx);
    const [eventKey] = rest;

    if (!eventKey) {
      throw new ValidationError('Usage: !force-event <@user> <clé évènement>');
    }

    const gen = allGenerators.find((candidate) => candidate.key === eventKey);
    if (!gen) {
      throw new NotFoundError(`Clé d'évènement inconnue: ${eventKey}`);
    }

    const bucketId = getNowBucketId();

    await db.transaction(async (tx) => {
      const player = await playerRepository.findByIdOrThrow(targetPlayer.id, tx, { forUpdate: true });
      const ctxData = await fetchGeneratorContextData(player, tx);
      const ctxForGenerator = buildGeneratorContext(ctxData, bucketId);

      if (gen.isInteractive) {
        await recordInteractive(gen, ctxForGenerator, tx);
        return;
      }

      const rng = createRngForGenerator(gen, ctxForGenerator);
      await recordPassive(gen, ctxForGenerator, ctxData, rng, tx);
    });
    const successMessage = `Évènement ${gen.key} ajouté à la queue de ${targetPlayer.name}`;
    await ctx.message.reply({ embeds: [buildOpEmbed('success').setDescription(successMessage)] });
  },
};
