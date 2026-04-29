import type { Command } from '../../../discord/types.js';
import { getSelfUser } from '../../../discord/utils/get-self-user.js';
import { findOrCreatePlayer } from '../../player/service.js';
import { getCrewByPlayerId } from '../service.js';
import { buildSetCaptainView } from '../set-captain-view.js';

export const setCaptainCommand: Command = {
  name: 'setcaptain',
  async handler(message) {
    const user = getSelfUser(message);
    const { player } = await findOrCreatePlayer(user.id, user.username);
    const crew = await getCrewByPlayerId(player.id);

    await message.reply(buildSetCaptainView(player, crew));
  },
};
