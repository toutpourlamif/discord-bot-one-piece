import { db } from '@one-piece/db';
import type { ButtonInteraction } from 'discord.js';

import { InternalError } from '../../../discord/errors.js';
import type { ButtonHandler } from '../../../discord/types.js';
import { parseBigintArg } from '../../../discord/utils/index.js';
import * as historyRepository from '../../history/index.js';
import * as playerRepository from '../../player/repository.js';
import { EVENT_BUTTON_NAME } from '../constants.js';
import { applyEffects } from '../effects/apply-effects.js';
import { getNowBucketId } from '../engine/bucket.js';
import { buildGeneratorContext, fetchGeneratorContextData } from '../engine/context-builders.js';
import { createRngForGenerator } from '../engine/rng.js';
import { findGeneratorByKeyOrThrow } from '../generators/registry.js';
import { buildRecapView } from '../recap/build-recap-view.js';
import * as eventRepository from '../repository.js';

export const eventChoiceButtonHandler: ButtonHandler = {
  name: EVENT_BUTTON_NAME,
  async handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
    await interaction.deferUpdate();

    const eventInstanceId = parseBigintArg(args[0]);

    const instance = await eventRepository.findById(eventInstanceId);
    if (!instance) {
      await interaction.followUp({ content: "Trop tard, l'évènement a déjà été résolu.", ephemeral: true });
      return;
    }

    const generator = findGeneratorByKeyOrThrow(instance.eventKey);

    if (!generator.isInteractive) {
      const player = await playerRepository.findByIdOrThrow(instance.playerId);
      await eventRepository.deleteById(instance.id);
      await interaction.editReply(await buildRecapView(player));
      return;
    }

    // TODO: Utiliser ParseStringArg ici
    const choiceId = args[1];
    if (!choiceId) throw new InternalError(`choice_id manquant pour évènement interactif: ${interaction.customId}`);

    const stepKey = instance.state.step;
    if (typeof stepKey !== 'string') throw new InternalError(`state.step invalide pour ${generator.key}: ${String(stepKey)}`);
    const step = generator.steps[stepKey];
    if (!step) throw new InternalError(`Step introuvable: ${stepKey} pour ${generator.key}`);

    const bucketId = getNowBucketId();

    const result = await db.transaction(async (tx) => {
      const player = await playerRepository.findByIdOrThrow(instance.playerId, tx, { forUpdate: true });
      const ctxData = await fetchGeneratorContextData(player, tx);
      const ctx = buildGeneratorContext(ctxData, bucketId);

      const choice = step.choices(instance.state, ctx).find((c) => c.id === choiceId);
      if (!choice) throw new InternalError(`Choix ${choiceId} introuvable dans ${generator.key}#${stepKey}`);

      if ('goTo' in choice) return null;

      const resolution = choice.resolve(ctx, createRngForGenerator(generator, ctx));
      await applyEffects(resolution.effects, ctx, tx);
      await historyRepository.writeEventResolution({ actorPlayerId: player.id, eventType: resolution.resolutionType, bucketId }, tx);
      await eventRepository.deleteById(instance.id, tx);
      return { resolution, player };
    });

    if (!result) {
      // TODO #198 : multi-étapes (updateState + re-render). Hors scope #192.
      await interaction.followUp({ content: 'TODO: goTo à brancher (cf #198).', ephemeral: true });
      return;
    }

    const nextView = await buildRecapView(result.player);
    await interaction.editReply({ embeds: [result.resolution.embed, ...nextView.embeds], components: nextView.components });
  },
};
