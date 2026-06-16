import type { Command } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/index.js';
import { resolveTargetPlayer } from '../../player/index.js';
import * as playerRepository from '../../player/repository.js';

// TODO: ne reproduit PAS l'état réel d'un joueur ayant fini l'onboarding : ça ne fait que
// passer onboardingStep à null. Il faudra plus tard matcher les items/récompenses obtenus
// pendant l'onboarding, la localisation de départ, etc.
export const skipOnboardingCommand: Command = {
  name: ['skip-onboarding', 'skipob'],
  async handler(ctx) {
    const { targetPlayer } = await resolveTargetPlayer(ctx);
    await playerRepository.setOnboardingStep(targetPlayer.id, null);

    await ctx.message.reply({ embeds: [buildOpEmbed().setDescription(`Onboarding de ${targetPlayer.name} marqué comme terminé.`)] });
  },
};
