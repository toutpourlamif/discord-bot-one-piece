import type { Command } from '../../../discord/types.js';
import { buildOpEmbed, getTargetUser } from '../../../discord/utils/index.js';
import * as playerRepository from '../../player/repository.js';
import { findOrCreatePlayer } from '../../player/service.js';

// TODO: ne reproduit PAS l'état réel d'un joueur ayant fini l'onboarding : ça ne fait que
// passer onboardingStep à null. Il faudra plus tard matcher les items/récompenses obtenus
// pendant l'onboarding, la localisation de départ, etc.
export const skipOnboardingCommand: Command = {
  name: ['skip-onboarding', 'skipob'],
  async handler({ message }) {
    const target = getTargetUser(message);

    const { player: targetPlayer } = await findOrCreatePlayer(target.id, target.username, message.guildId!);
    await playerRepository.setOnboardingStep(targetPlayer.id, null);

    await message.reply({ embeds: [buildOpEmbed().setDescription(`Onboarding de ${targetPlayer.name} marqué comme terminé.`)] });
  },
};
