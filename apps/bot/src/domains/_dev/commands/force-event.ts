import { db } from '@one-piece/db';

import { NotFoundError, ValidationError } from '../../../discord/errors.js';
import type { Command } from '../../../discord/types.js';
import { getTargetUser } from '../../../discord/utils/index.js';
import { bucketIdFromTimestamp } from '../../event/engine/bucket.js';
import { buildGeneratorContext, fetchGeneratorContextData } from '../../event/engine/context-builders.js';
import { recordInteractive, recordPassive } from '../../event/engine/record-event.js';
import { createRngForGenerator } from '../../event/engine/rng.js';
import { allGenerators } from '../../event/generators/registry.js';
import * as playerRepository from '../../player/repository.js';
import { findOrCreatePlayer } from '../../player/service.js';

export const forceEventCommand: Command = {
  name: ['forceEvent', 'force-event'],
  async handler(ctx) {
    const [rawTarget, eventKey] = ctx.args;
    if (!rawTarget || !eventKey) {
      throw new ValidationError('Usage: !force-event <mention ou id joueur> <clé évènement>');
    }

    const gen = allGenerators.find((candidate) => candidate.key === eventKey);
    if (!gen) {
      throw new ValidationError(`Clé d'évènement inconnue: ${eventKey}`);
    }

    const hasMentionedTarget = ctx.message.mentions.users.size > 0;
    const targetUser = hasMentionedTarget ? getTargetUser(ctx.message) : await ctx.message.client.users.fetch(rawTarget).catch(() => null);
    if (!targetUser) throw new NotFoundError(`Joueur introuvable: ${rawTarget}`);

    const { player: targetPlayer } = await findOrCreatePlayer(targetUser.id, targetUser.username, ctx.guild.id);
    const bucketId = bucketIdFromTimestamp(new Date());

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

    await ctx.message.reply(`Évènement ajouté à la queue de ${targetPlayer.name}.`);
  },
};
