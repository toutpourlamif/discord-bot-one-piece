import { db } from '@one-piece/db';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type ButtonInteraction } from 'discord.js';

import { PAGINATION } from '../../../discord/constants.js';
import { InternalError } from '../../../discord/errors.js';
import type { ButtonHandler, View } from '../../../discord/types.js';
import { parseBigintArg } from '../../../discord/utils/index.js';
import * as historyRepository from '../../history/index.js';
import * as playerRepository from '../../player/repository.js';
import { EVENT_BUTTON_NAME } from '../constants.js';
import { applyEffects } from '../effects/apply-effects.js';
import { getNowBucketId } from '../engine/bucket.js';
import { buildGeneratorContext, fetchGeneratorContextData } from '../engine/context-builders.js';
import { createRngForGenerator } from '../engine/rng.js';
import { synchronizePlayer } from '../engine/synchronize-player.js';
import { findGeneratorByKeyOrThrow } from '../generators/registry.js';
import { buildInteractiveStepView } from '../recap/build-interactive-step-view.js';
import { buildRecapView } from '../recap/build-recap-view.js';
import * as eventRepository from '../repository.js';
import type { Resolution } from '../types.js';
import { buildEventNextCustomId } from '../utils/build-event-custom-id.js';

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
      await interaction.editReply(await buildRecapView(player, true));
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

      if ('goTo' in choice) {
        if (!generator.steps[choice.goTo]) throw new InternalError(`goTo vers step inexistant: ${choice.goTo} pour ${generator.key}`);
        const nextState = { ...instance.state, step: choice.goTo };
        await eventRepository.updateState(instance.id, nextState, tx);
        return { kind: 'goTo' as const, nextState, ctx };
      }

      const resolution = choice.resolve(ctx, createRngForGenerator(generator, ctx));
      await applyEffects(resolution.effects, ctx, tx);
      await historyRepository.writeEventResolution({ actorPlayerId: player.id, kind: resolution.resolutionType, bucketId }, tx);
      await eventRepository.deleteById(instance.id, tx);
      return { kind: 'resolved' as const, resolution, player };
    });

    if (result.kind === 'goTo') {
      const view = buildInteractiveStepView({
        generator,
        instanceId: instance.id,
        state: result.nextState,
        bucketId: instance.bucketId,
        ctx: result.ctx,
      });
      await interaction.editReply(view);
      return;
    }

    await synchronizePlayer(result.player.id);

    await interaction.editReply(buildResolutionView(result.resolution, result.player.discordId));
  },
};

function buildResolutionView(resolution: Resolution, ownerDiscordId: string): View {
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(buildEventNextCustomId(ownerDiscordId))
      .setEmoji(PAGINATION.next.emoji)
      .setLabel(PAGINATION.next.label)
      .setStyle(ButtonStyle.Primary),
  );
  return { embeds: [resolution.embed], components: [row] };
}
