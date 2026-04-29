import type { Command } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/build-op-embed.js';
import { getSelfUser } from '../../../discord/utils/get-self-user.js';
import { prefix } from '../../../index.js';
import { getCharacterInstanceName } from '../../character/utils/index.js';
import { findOrCreatePlayer } from '../../player/service.js';
import { getCrewByPlayerId } from '../service.js';
import { buildSetCaptainView } from '../utils/build-change-captain-view.js';

import { crewCommand } from './crew.js';

const crewCommandName = crewCommand.name;

export const changeCaptainCommand: Command = {
  name: 'changecaptain',
  async handler(message) {
    const user = getSelfUser(message);
    const { player } = await findOrCreatePlayer(user.id, user.username);
    const crew = await getCrewByPlayerId(player.id);

    if (crew.length === 1) {
      const captain = crew[0]!;

      await message.reply({
        embeds: [
          buildOpEmbed('warn')
            .setDescription(`Votre équipage n'est composé que de **${getCharacterInstanceName(captain)}**.`)
            .setFooter({ text: `${prefix}${crewCommandName} pour voir votre équipage!` }),
        ],
      });
      return;
    }

    await message.reply(buildSetCaptainView(player, crew));
  },
};
