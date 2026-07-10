import type { Transaction } from '@one-piece/db';

import type { View } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/index.js';
import * as resourceRepository from '../../resource/repository.js';

export function matchesOroJacksonQuery(args: Array<string>): boolean {
  return args.join(' ').trim().toLowerCase() === 'oro jackson';
}

// TODO: stub — remplacer par une vraie fiche navire une fois une mécanique "navire légendaire" disponible.
export async function runInfoMission(playerId: number, tx: Transaction): Promise<View> {
  await resourceRepository.addResource({ playerId, name: 'Encyclopédie de Gold Roger', quantity: 1, options: { client: tx } });
  return {
    embeds: [
      buildOpEmbed()
        .setTitle('Oro Jackson')
        .setDescription("Le navire légendaire de Gold Roger. C'est à son bord qu'il a fait le tour de Grand Line jusqu'à Raftel."),
    ],
    components: [],
  };
}

export function buildInfoMissionReminder(prefix: string, expects: string): View {
  return {
    embeds: [
      buildOpEmbed('info')
        .setTitle("L'encyclopédie t'attend.")
        .setDescription(
          `« Tu trouveras là-dedans toutes les informations que tu veux. Tiens, par exemple : tu sais sur quel bateau naviguait Gold Roger ? ` +
            `Il s'appelait l'Oro Jackson. Jettes-y un coup d'œil. »\n\nTape \`${prefix}${expects} oro jackson\`.`,
        ),
    ],
    components: [],
  };
}
