import type { View } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/index.js';

export function runKickoff(): View {
  return {
    embeds: [buildOpEmbed('success').setTitle("Levée d'ancre.").setDescription('Ton aventure de pirate commence maintenant.')],
    components: [],
  };
}
// TODO: mettre un vrai texte
export function buildKickoffReminder(prefix: string, expects: string): View {
  return {
    embeds: [
      buildOpEmbed('info')
        .setTitle('Bienvenue sur Grand Line.')
        .setDescription(
          `Tu n'as pas encore commencé accès à cette commande.\nIl faut d'abord démarrer ton aventure! Commence là en tapant \`${prefix}${expects}\`.`,
        ),
    ],
    components: [],
  };
}
