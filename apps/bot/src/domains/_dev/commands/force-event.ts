import { db, type Player } from '@one-piece/db';

import { DISCORD_ID_REGEX } from '../../../discord/constants.js';
import { NotFoundError, ValidationError } from '../../../discord/errors.js';
import type { Command } from '../../../discord/types.js';
import { getNowBucketId } from '../../event/engine/bucket.js';
import { buildGeneratorContext, fetchGeneratorContextData } from '../../event/engine/context-builders.js';
import { recordInteractive, recordPassive } from '../../event/engine/record-event.js';
import { createRngForGenerator } from '../../event/engine/rng.js';
import { allGenerators } from '../../event/generators/registry.js';
import { resolveTargetPlayer } from '../../player/index.js';
import * as playerRepository from '../../player/repository.js';
import { findOrCreatePlayer } from '../../player/service.js';

export const forceEventCommand: Command = {
  name: ['forceEvent', 'force-event'],
  async handler(ctx) {
    let targetPlayer: Player;
    let eventKey: string | undefined;

    if (ctx.message.mentions.users.size > 0) {
      const resolved = await resolveTargetPlayer(ctx);
      targetPlayer = resolved.targetPlayer;
      [eventKey] = resolved.rest;
    } else {
      const [rawTargetId, rawEventKey] = ctx.args;
      if (!rawTargetId || !DISCORD_ID_REGEX.test(rawTargetId)) {
        throw new ValidationError('Usage: !force-event <mention ou id joueur> <clé évènement>');
      }

      const targetUser = await ctx.message.client.users.fetch(rawTargetId).catch(() => null);
      if (!targetUser) throw new NotFoundError(`Joueur introuvable: ${rawTargetId}`);

      const result = await findOrCreatePlayer(targetUser.id, targetUser.username, ctx.guild.id);
      targetPlayer = result.player;
      eventKey = rawEventKey;
    }

    if (!eventKey) {
      throw new ValidationError('Usage: !force-event <mention ou id joueur> <clé évènement>');
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

    await ctx.message.reply(`Évènement ajouté à la queue de ${targetPlayer.name}.`);
  },
};
