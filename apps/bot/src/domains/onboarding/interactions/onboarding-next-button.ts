import { db, type OnboardingStepId } from '@one-piece/db';
import type { ButtonInteraction } from 'discord.js';

import type { ButtonHandler, View } from '../../../discord/types.js';
import { assertInteractorIsTheOwner, editReply, parseOwnerDiscordId, parseStringArg } from '../../../discord/utils/index.js';
import { requireGuildId } from '../../guild/index.js';
import * as guildRepository from '../../guild/repository.js';
import * as playerRepository from '../../player/repository.js';
import { ONBOARDING_NEXT_BUTTON_NAME } from '../constants.js';
import * as onboardingService from '../services/index.js';
import { getStep } from '../step-registry.js';
import { buildOnboardingCompletedView } from '../views/build-onboarding-completed-view.js';
import { buildNextButtonRow, buildOnboardingView, DEFAULT_SCENE_BUTTON_LABEL } from '../views/build-onboarding-view.js';

export const onboardingNextButtonHandler: ButtonHandler = {
  name: ONBOARDING_NEXT_BUTTON_NAME,
  async handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
    const ownerDiscordId = parseOwnerDiscordId(args[0]);
    assertInteractorIsTheOwner(interaction, ownerDiscordId);
    await interaction.deferUpdate();

    const stepId = parseStringArg(args[1], 'stepId manquant dans le customId');
    const guild = await guildRepository.findOrCreate(requireGuildId(interaction.guildId), interaction.guild!.name);
    const player = await playerRepository.findByDiscordIdOrThrow(ownerDiscordId);

    let consequence: { view: View; departedStepId: OnboardingStepId } | undefined;

    const resultingStep = await db.transaction(async (tx) => {
      const locked = await playerRepository.findByIdOrThrow(player.id, tx, { forUpdate: true });
      if (locked.onboardingStep !== stepId) return locked.onboardingStep;
      const step = getStep(stepId);
      if (step.type === 'scene' && step.onAdvance) {
        const view = await step.onAdvance(player.id, tx);
        if (view) consequence = { view, departedStepId: step.id };
      }
      const { nextStep } = await onboardingService.advanceOnboarding(player.id, tx);
      return nextStep;
    });

    // Le bouton garde volontairement l'ANCIEN stepId : au clic, onb-next constate que ce n'est plus le step
    // courant (déjà avancé) et se contente de re-render la vue courante — même mécanisme que pour les MissionStep.
    if (consequence) {
      await editReply(interaction, {
        embeds: consequence.view.embeds,
        components: [buildNextButtonRow({ stepId: consequence.departedStepId, label: DEFAULT_SCENE_BUTTON_LABEL, ownerDiscordId })],
      });
      return;
    }

    const view =
      resultingStep === null
        ? buildOnboardingCompletedView(guild.language)
        : buildOnboardingView({ stepId: resultingStep, prefix: guild.prefix, language: guild.language, ownerDiscordId });
    await editReply(interaction, view);
  },
};
