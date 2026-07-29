import type { Guild } from '@one-piece/db';

import type { Command, View } from '../../../discord/types.js';
import { buildOpEmbed, getFormattedCommand } from '../../../discord/utils/index.js';

export function runKickoff(): View {
  return {
    embeds: [buildOpEmbed('success').setTitle("Levée d'ancre.").setDescription('Ton aventure de pirate commence maintenant.')],
    components: [],
  };
}

export function buildKickoffReminder(guild: Guild, command: Command): View {
  return {
    embeds: [
      buildOpEmbed('info')
        .setTitle('Bienvenue sur Grand Line.')
        .setDescription(`Démarre ton aventure en tapant ${getFormattedCommand(guild, command)}.`),
    ],
    components: [],
  };
}
