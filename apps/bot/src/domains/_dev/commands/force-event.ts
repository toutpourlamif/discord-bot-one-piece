import { db, eventInstance } from '@one-piece/db';

import { NotFoundError, ValidationError } from '../../../discord/errors.js';
import type { Command } from '../../../discord/types.js';
import { getTargetUser } from '../../../discord/utils/index.js';
import * as characterRepository from '../../character/repository.js';
import { isInCrewFilter } from '../../crew/utils/is-in-crew-filter.js';
import { applyEffects } from '../../event/effects/apply-effects.js';
import { bucketIdFromTimestamp } from '../../event/engine/bucket.js';
import { buildCrewAccessor, buildHistoryAccessor } from '../../event/engine/context-builders.js';
import { createRng, seedFromBucketAndPlayer, seedFromBucketAndZone } from '../../event/engine/rng.js';
import { allGenerators } from '../../event/generators/registry.js';
import type { GeneratorContext } from '../../event/types.js';
import * as historyRepository from '../../history/index.js';
import * as playerRepository from '../../player/repository.js';
import { findOrCreatePlayer } from '../../player/service.js';
import * as resourceRepository from '../../resource/repository.js';
import * as shipRepository from '../../ship/repository.js';

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
      const ship = await shipRepository.findByPlayerIdOrThrow(player.id, tx);
      const inventory = await resourceRepository.getInventory(player.id, tx);
      const allCharacters = await characterRepository.getCharactersByPlayerId(player.id, tx);
      const historyLogs = await historyRepository.loadAllForPlayer(player.id, tx);

      const ctxForGenerator: GeneratorContext = {
        player,
        crew: buildCrewAccessor(allCharacters.filter(isInCrewFilter)),
        ship,
        inventory,
        history: buildHistoryAccessor(historyLogs, () => bucketId),
        bucketId,
        zone: player.currentZone,
        othersInZone: [],
      };

      const seed =
        gen.seedScope === 'zone' ? seedFromBucketAndZone(bucketId, ctxForGenerator.zone) : seedFromBucketAndPlayer(bucketId, player.id);
      const rng = createRng(seed);

      if (gen.isInteractive) {
        await tx
          .insert(eventInstance)
          .values({ playerId: player.id, eventKey: gen.key, isInteractive: true, bucketId, state: { step: gen.initial } });
        return;
      }

      const { effects, state } = gen.compute(ctxForGenerator, rng);
      await tx.insert(eventInstance).values({ playerId: player.id, eventKey: gen.key, isInteractive: false, bucketId, state });
      await applyEffects(effects, ctxForGenerator, tx);
    });

    await ctx.message.reply(`Évènement ajouté à la queue de ${targetPlayer.name}.`);
  },
};
