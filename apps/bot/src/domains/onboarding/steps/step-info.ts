import type { SupportedLanguage } from '@one-piece/db';

import { buildCommandHint } from '../../../discord/command-names.js';
import type { View } from '../../../discord/types.js';
import { buildDialogueEmbed, buildOpEmbed } from '../../../discord/utils/index.js';
import { infoCommand } from '../../_info/commands/info.js';

import { STORYTELLER } from './step-storyteller.js';

export function matchesOroJacksonQuery(args: Array<string>): boolean {
  return args.join(' ').trim().toLowerCase() === 'oro jackson';
}

// TODO: stub — remplacer par une vraie fiche navire une fois une mécanique "navire légendaire" disponible.
export function runInfoMission(): View {
  return {
    embeds: [
      buildOpEmbed()
        .setTitle('Oro Jackson')
        .setDescription("Le navire légendaire de Gold Roger. C'est à son bord qu'il a fait le tour de Grand Line jusqu'à Raftel."),
    ],
    components: [],
  };
}

export function buildInfoMissionReminder(prefix: string, language: SupportedLanguage): View {
  return {
    embeds: [
      buildDialogueEmbed(
        STORYTELLER,
        `Tiens, tu sais sur quel bateau naviguait Gold Roger ?\nCherche dans l'**Encyclopédie**.\n\n\`${buildCommandHint(prefix, infoCommand, language)} oro jackson\``,
        { customVerb: 'vous demande' },
      ),
    ],
    components: [],
  };
}
