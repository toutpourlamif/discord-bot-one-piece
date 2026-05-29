import type { OnboardingStepId, Player } from '@one-piece/db';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import { InternalError } from '../../discord/errors.js';
import type { View } from '../../discord/types.js';
import { buildCustomId } from '../../discord/utils/build-custom-id.js';
import { buildOpEmbed } from '../../discord/utils/index.js';

import { ONBOARDING_NEXT_BUTTON_NAME } from './constants.js';
import { getStep } from './step-registry.js';

const DEFAULT_SCENE_BUTTON_LABEL = 'Continuer';

export function buildOnboardingView(player: Player, prefix: string): View {
  const stepId = player.onboardingStep;
  if (stepId === null) throw new InternalError('buildOnboardingView appelé hors onboarding');
  const step = getStep(stepId);

  if (step.type === 'mission') return step.reminder(prefix, step.expects);

  return {
    embeds: [step.embed(player)],
    components: [buildNextButtonRow(step.id, step.buttonLabel ?? DEFAULT_SCENE_BUTTON_LABEL)],
  };
}

export function buildOnboardingCompletedView(): View {
  return {
    embeds: [buildOpEmbed('success').setTitle('Bon vent, pirate.').setDescription('Ton aventure commence vraiment maintenant.')],
    components: [],
  };
}

function buildNextButtonRow(stepId: OnboardingStepId, label: string): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(buildCustomId(ONBOARDING_NEXT_BUTTON_NAME, stepId)).setLabel(label).setStyle(ButtonStyle.Primary),
  );
}
