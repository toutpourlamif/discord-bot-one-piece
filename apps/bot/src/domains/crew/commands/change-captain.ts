import type { Command } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/build-op-embed.js';
import { formatCommand } from '../../../discord/utils/index.js';
import { getCrewByPlayerId } from '../service.js';
import { buildSetCaptainView } from '../utils/build-change-captain-view.js';

export const changeCaptainCommand: Command = {
  name: 'changecaptain',
  async handler({ message, player, guild }) {
    const crew = await getCrewByPlayerId(player.id);

    if (crew.length === 1) {
      const captain = crew[0]!;

      await message.reply({
        embeds: [
          buildOpEmbed('warn')
            .setDescription(`Votre équipage n'est composé que de **${captain.name}**.`)
            .setFooter({ text: `${formatCommand(guild.prefix, 'crew', { backticks: false })} pour voir votre équipage!` }),
        ],
      });
      return;
    }

    await message.reply(buildSetCaptainView(player, crew));
  },
};
