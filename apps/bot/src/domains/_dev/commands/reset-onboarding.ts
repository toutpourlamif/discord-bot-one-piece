import type { Command } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/index.js';
import * as onboardingService from '../../onboarding/services/index.js';
import { getFirstStepId } from '../../onboarding/step-registry.js';
import { buildOnboardingStepChangeMessage } from '../../onboarding/utils/build-onboarding-step-change-message.js';
import { resolveTargetPlayer } from '../../player/index.js';

// TODO: ne reproduit PAS l'état réel d'un joueur qui n'a jamais commencé l'onboarding : ça ne fait
// que remettre onboardingStep au premier step. Les items/persos obtenus pendant un run précédent
// (encyclopédie, Koby, canne à pêche...) ne sont pas retirés.
export const resetOnboardingCommand: Command = {
  names: { fr: 'reset-onboarding', en: 'reset-onboarding' },
  aliases: { fr: ['resetob'], en: ['resetob'] },
  async handler(ctx) {
    const { targetPlayer } = await resolveTargetPlayer(ctx);
    const change = await onboardingService.setOnboardingStep(targetPlayer.id, getFirstStepId());

    await ctx.message.reply({
      embeds: [buildOpEmbed('success').setDescription(buildOnboardingStepChangeMessage(targetPlayer.name, change))],
    });
  },
};
