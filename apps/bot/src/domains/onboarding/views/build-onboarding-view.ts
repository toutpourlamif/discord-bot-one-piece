import type { OnboardingStepId, SupportedLanguage } from '@one-piece/db';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import type { View } from '../../../discord/types.js';
import { buildCustomId } from '../../../discord/utils/build-custom-id.js';
import { ONBOARDING_NEXT_BUTTON_NAME } from '../constants.js';
import { getStep } from '../step-registry.js';

export const DEFAULT_SCENE_BUTTON_LABEL = 'Continuer';

type BuildOnboardingViewParams = { stepId: OnboardingStepId; prefix: string; language: SupportedLanguage; ownerDiscordId: string };

export function buildOnboardingView({ stepId, prefix, language, ownerDiscordId }: BuildOnboardingViewParams): View {
  const step = getStep(stepId);

  if (step.type === 'mission') return step.reminder(prefix, language);

  return {
    embeds: [step.embed()],
    components: step.buildComponents
      ? step.buildComponents({ stepId: step.id, ownerDiscordId })
      : [buildNextButtonRow({ stepId: step.id, label: step.buttonLabel ?? DEFAULT_SCENE_BUTTON_LABEL, ownerDiscordId })],
  };
}

type NextButtonRowParams = { stepId: OnboardingStepId; label: string; ownerDiscordId: string };

export function buildNextButtonRow({ stepId, label, ownerDiscordId }: NextButtonRowParams): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(buildCustomId(ONBOARDING_NEXT_BUTTON_NAME, ownerDiscordId, stepId))
      .setLabel(label)
      .setStyle(ButtonStyle.Primary),
  );
}
