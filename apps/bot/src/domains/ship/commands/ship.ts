import type { Command } from '../../../discord/types.js';
import { getTargetUser } from '../../../discord/utils/index.js';
import { findOrCreatePlayer } from '../../player/service.js';
import { buildShipView } from '../ship-view.js';

export const shipCommand: Command = {
  name: 'ship',
  async handler(message) {
    const user = getTargetUser(message);
    const { player } = await findOrCreatePlayer(user.id, user.username);
    await message.reply(await buildShipView(player.id));
  },
};
