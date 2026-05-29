import type { OnboardingStepId } from '@one-piece/db';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import type { View } from '../../../discord/types.js';
import { buildCustomId } from '../../../discord/utils/build-custom-id.js';
import { ONBOARDING_NEXT_BUTTON_NAME } from '../constants.js';
import { getStep } from '../step-registry.js';

const DEFAULT_SCENE_BUTTON_LABEL = 'Continuer';

export function buildOnboardingView(stepId: OnboardingStepId, prefix: string): View {
  const step = getStep(stepId);

  if (step.type === 'mission') return step.reminder(prefix, step.expects);

  return {
    embeds: [step.embed()],
    components: [buildNextButtonRow(step.id, step.buttonLabel ?? DEFAULT_SCENE_BUTTON_LABEL)],
  };
}

function buildNextButtonRow(stepId: OnboardingStepId, label: string): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(buildCustomId(ONBOARDING_NEXT_BUTTON_NAME, stepId)).setLabel(label).setStyle(ButtonStyle.Primary),
  );
}
