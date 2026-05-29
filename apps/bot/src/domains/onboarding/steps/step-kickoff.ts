import type { View } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/index.js';

export function runKickoff(): View {
  return {
    embeds: [buildOpEmbed('success').setTitle("Levée d'ancre.").setDescription('Ton aventure de pirate commence maintenant.')],
    components: [],
  };
}

export function buildKickoffReminder(prefix: string, expects: string): View {
  return {
    embeds: [
      buildOpEmbed('info').setTitle('Bienvenue sur Grand Line.').setDescription(`Démarre ton aventure en tapant \`${prefix}${expects}\`.`),
    ],
    components: [],
  };
}
