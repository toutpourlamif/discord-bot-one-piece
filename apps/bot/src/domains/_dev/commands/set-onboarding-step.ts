import { ValidationError } from '../../../discord/errors.js';
import type { Command } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/index.js';
import * as onboardingService from '../../onboarding/services/index.js';
import { findStepByFuzzyIdOrThrow } from '../../onboarding/step-registry.js';
import { buildOnboardingStepChangeMessage } from '../../onboarding/utils/build-onboarding-step-change-message.js';
import { resolveTargetPlayer } from '../../player/index.js';

export const setOnboardingStepCommand: Command = {
  names: { fr: 'set-onboarding-step', en: 'set-onboarding-step' },
  aliases: { fr: ['setob'], en: ['setob'] },
  async handler(ctx) {
    const { targetPlayer, rest } = await resolveTargetPlayer(ctx);
    const query = rest.join(' ');
    if (!query) throw new ValidationError('Usage : !setob <nom du step>.');

    const step = findStepByFuzzyIdOrThrow(query);
    const change = await onboardingService.setOnboardingStep(targetPlayer.id, step.id);

    await ctx.message.reply({
      embeds: [buildOpEmbed('success').setDescription(buildOnboardingStepChangeMessage(targetPlayer.name, change))],
    });
  },
};
