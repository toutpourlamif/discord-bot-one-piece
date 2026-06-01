import { db, type EventInstance, type JSONFromSQL, type Player } from '@one-piece/db';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type ButtonInteraction } from 'discord.js';

import { PAGINATION } from '../../../discord/constants.js';
import { InternalError } from '../../../discord/errors.js';
import type { ButtonHandler, View } from '../../../discord/types.js';
import { parseBigintArg, parseStringArg } from '../../../discord/utils/index.js';
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
import type { GeneratorContext, InteractiveGenerator, Resolution } from '../types.js';
import { buildEventNextCustomId } from '../utils/build-event-custom-id.js';

export const eventChoiceButtonHandler: ButtonHandler = {
  name: EVENT_BUTTON_NAME,
  async handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
    await interaction.deferUpdate();

    const instance = await eventRepository.findById(parseBigintArg(args[0]));
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

    const choiceId = parseStringArg(args[1], `choice_id manquant pour évènement interactif: ${interaction.customId}`);
    const outcome = await applyChoice({ generator, instance, choiceId });

    if (outcome.type === 'goTo') {
      const view = buildInteractiveStepView({
        generator,
        instanceId: instance.id,
        state: outcome.nextState,
        bucketId: instance.bucketId,
        ctx: outcome.ctx,
      });
      await interaction.editReply(view);
      return;
    }

    await synchronizePlayer(outcome.player.id);
    await interaction.editReply(buildResolutionView(outcome.resolution, outcome.player.discordId));
  },
};

type ApplyChoiceParams = {
  generator: InteractiveGenerator;
  instance: EventInstance;
  choiceId: string;
};

type ChoiceOutcome =
  | { type: 'goTo'; nextState: JSONFromSQL; ctx: GeneratorContext }
  | { type: 'resolved'; resolution: Resolution; player: Player };

async function applyChoice({ generator, instance, choiceId }: ApplyChoiceParams): Promise<ChoiceOutcome> {
  const { stepKey, step } = getStep(generator, instance.state);
  const bucketId = getNowBucketId();

  return db.transaction(async (tx) => {
    const player = await playerRepository.findByIdOrThrow(instance.playerId, tx, { forUpdate: true });
    const ctx = buildGeneratorContext(await fetchGeneratorContextData(player, tx), bucketId);

    const choice = step.choices(instance.state, ctx).find((c) => c.id === choiceId);
    if (!choice) throw new InternalError(`Choix ${choiceId} introuvable dans ${generator.key}#${stepKey}`);

    if ('goTo' in choice) {
      if (!generator.steps[choice.goTo]) throw new InternalError(`goTo vers step inexistant: ${choice.goTo} pour ${generator.key}`);
      const nextState = { ...instance.state, step: choice.goTo };
      await eventRepository.updateState(instance.id, nextState, tx);
      return { type: 'goTo' as const, nextState, ctx };
    }

    const resolution = choice.resolve(ctx, createRngForGenerator(generator, ctx));
    await applyEffects(resolution.effects, ctx, tx);
    await historyRepository.writeEventResolution({ actorPlayerId: player.id, type: resolution.resolutionType, bucketId }, tx);
    await eventRepository.deleteById(instance.id, tx);
    return { type: 'resolved' as const, resolution, player };
  });
}

function getStep(generator: InteractiveGenerator, state: JSONFromSQL) {
  const stepKey = state.step;
  if (typeof stepKey !== 'string') throw new InternalError(`state.step invalide pour ${generator.key}: ${String(stepKey)}`);
  const step = generator.steps[stepKey];
  if (!step) throw new InternalError(`Step introuvable: ${stepKey} pour ${generator.key}`);
  return { stepKey, step };
}

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
