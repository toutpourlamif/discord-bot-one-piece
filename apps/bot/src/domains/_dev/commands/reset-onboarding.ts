import type { Command } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/index.js';
import { getFirstStepId } from '../../onboarding/step-registry.js';
import { resolveTargetPlayer } from '../../player/index.js';
import * as playerRepository from '../../player/repository.js';

// TODO: ne reproduit PAS l'état réel d'un joueur qui n'a jamais commencé l'onboarding : ça ne fait
// que remettre onboardingStep au premier step. Les items/persos obtenus pendant un run précédent
// (encyclopédie, Koby, canne à pêche...) ne sont pas retirés.
export const resetOnboardingCommand: Command = {
  names: { fr: 'reset-onboarding', en: 'reset-onboarding' },
  aliases: { fr: ['resetob'], en: ['resetob'] },
  async handler(ctx) {
    const { targetPlayer } = await resolveTargetPlayer(ctx);
    await playerRepository.setOnboardingStep(targetPlayer.id, getFirstStepId());

    await ctx.message.reply({ embeds: [buildOpEmbed().setDescription(`Onboarding de ${targetPlayer.name} réinitialisé.`)] });
  },
};
