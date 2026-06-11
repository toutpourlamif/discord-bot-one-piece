import { getCommandDisplayName } from '../../../discord/command-names.js';
import type { Command } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/build-op-embed.js';
import { getCrewByPlayerId } from '../service.js';
import { buildSetCaptainView } from '../utils/build-change-captain-view.js';

import { crewCommand } from './crew.js';

export const changeCaptainCommand: Command = {
  name: { fr: 'changecaptain', en: 'changecaptain' },
  async handler({ message, player, guild }) {
    const crew = await getCrewByPlayerId(player.id);

    if (crew.length === 1) {
      const captain = crew[0]!;

      await message.reply({
        embeds: [
          buildOpEmbed('warn')
            .setDescription(`Votre équipage n'est composé que de **${captain.name}**.`)
            .setFooter({ text: `${guild.prefix}${getCommandDisplayName(crewCommand, guild.language)} pour voir votre équipage!` }),
        ],
      });
      return;
    }

    await message.reply(buildSetCaptainView(player, crew));
  },
};
