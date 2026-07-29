import type { Guild } from '@one-piece/db';

import type { Command, View } from '../../../discord/types.js';
import { buildDialogueEmbed, buildOpEmbed, getFormattedCommand } from '../../../discord/utils/index.js';
import { DOMAIN_EMOJI, DOMAIN_LABEL } from '../../../shared/domains.js';

import { STORYTELLER } from './step-storyteller.js';

export function matchesOroJacksonQuery(args: Array<string>): boolean {
  return args.join(' ').trim().toLowerCase() === 'oro jackson';
}

// TODO: stub — pas de domaine "ship" dans !info (aucun navire hors celui du joueur n'est en base) ; remplacer
// par une vraie fiche navire une fois une mécanique "navire légendaire" disponible.
export function runInfoMission(): View {
  return {
    embeds: [
      buildOpEmbed()
        .setTitle('Oro Jackson')
        .setDescription("Le navire légendaire de Gold Roger. C'est à son bord qu'il a fait le tour de Grand Line jusqu'à Raftel.")
        .setFooter({ text: `${DOMAIN_EMOJI.ship} ${DOMAIN_LABEL.ship}` }),
    ],
    components: [],
  };
}

export function buildInfoMissionReminder(guild: Guild, command: Command): View {
  return {
    embeds: [
      buildDialogueEmbed(
        STORYTELLER,
        `Tiens, tu sais sur quel bateau naviguait Gold Roger ?\nCherche dans l'**Encyclopédie**.\n\n\`${getFormattedCommand(guild, command)} oro jackson\``,
        { customVerb: 'vous demande' },
      ),
    ],
    components: [],
  };
}
