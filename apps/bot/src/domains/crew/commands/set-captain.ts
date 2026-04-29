import type { Command } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/build-op-embed.js';
import { getSelfUser } from '../../../discord/utils/get-self-user.js';
import { getCharacterInstanceName } from '../../character/utils/index.js';
import { findOrCreatePlayer } from '../../player/service.js';
import { getCrewByPlayerId } from '../service.js';
import { buildSetCaptainView } from '../set-captain-view.js';

export const setCaptainCommand: Command = {
  name: 'setcaptain',
  async handler(message) {
    const user = getSelfUser(message);
    const { player } = await findOrCreatePlayer(user.id, user.username);
    const crew = await getCrewByPlayerId(player.id);

    if (crew.length === 1) {
      const captain = crew[0];
      if (!captain) return;

      await message.reply({
        embeds: [
          buildOpEmbed('warn').setDescription(`T'as qu'un seul perso : **${getCharacterInstanceName(captain)}** est forcément capitaine.`),
        ],
      });
      return;
    }

    await message.reply(buildSetCaptainView(player, crew));
  },
};
