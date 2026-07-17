import type { SupportedLanguage } from '@one-piece/db';

import { buildCommandHint } from '../../../discord/command-names.js';
import type { View } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/index.js';
import { introCommand } from '../commands/intro.js';

export function runKickoff(): View {
  return {
    embeds: [buildOpEmbed('success').setTitle("Levée d'ancre.").setDescription('Ton aventure de pirate commence maintenant.')],
    components: [],
  };
}
// TODO: mettre un vrai texte
export function buildKickoffReminder(prefix: string, language: SupportedLanguage): View {
  return {
    embeds: [
      buildOpEmbed('info')
        .setTitle('Bienvenue sur Grand Line.')
        .setDescription(
          `Tu n'as pas encore accès à cette commande.\nIl faut d'abord démarrer ton aventure !\n\n\`${buildCommandHint(prefix, introCommand, language)}\``,
        ),
    ],
    components: [],
  };
}
