import type { Command } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/index.js';
import * as onboardingService from '../../onboarding/services/index.js';
import { buildOnboardingStepChangeMessage } from '../../onboarding/utils/build-onboarding-step-change-message.js';
import { resolveTargetPlayer } from '../../player/index.js';

// TODO: ne reproduit PAS l'état réel d'un joueur ayant fini l'onboarding : ça ne fait que
// passer onboardingStep à null. Il faudra plus tard matcher les items/récompenses obtenus
// pendant l'onboarding, la localisation de départ, etc.
export const skipOnboardingCommand: Command = {
  names: { fr: 'skip-onboarding', en: 'skip-onboarding' },
  aliases: { fr: ['skipob'], en: ['skipob'] },
  async handler(ctx) {
    const { targetPlayer } = await resolveTargetPlayer(ctx);
    const change = await onboardingService.setOnboardingStep(targetPlayer.id, null);

    await ctx.message.reply({
      embeds: [buildOpEmbed('success').setDescription(buildOnboardingStepChangeMessage(targetPlayer.name, change))],
    });
  },
};
