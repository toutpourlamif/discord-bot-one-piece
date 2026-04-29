import type { Command } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/build-op-embed.js';
import { getSelfUser } from '../../../discord/utils/get-self-user.js';
import { getCharacterInstanceName } from '../../character/utils/index.js';
import { findOrCreatePlayer } from '../../player/service.js';
import { buildSetCaptainView } from '../build-change-captain-view.js';
import { getCrewByPlayerId } from '../service.js';

export const changeCaptainCommand: Command = {
  name: 'setcaptain',
  async handler(message) {
    const user = getSelfUser(message);
    const { player } = await findOrCreatePlayer(user.id, user.username);
    const crew = await getCrewByPlayerId(player.id);

    if (crew.length === 1) {
      const captain = crew[0]!;

      await message.reply({
        embeds: [
          buildOpEmbed('warn').setDescription(
            `Vous n'avez qu'un seul personnage : **${getCharacterInstanceName(captain)}** est forcément capitaine.`,
          ),
        ],
      });
      return;
    }

    await message.reply(buildSetCaptainView(player, crew));
  },
};
