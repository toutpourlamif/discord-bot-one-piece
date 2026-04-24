import { buildMenuView } from '../../../discord/menu/index.js';
import type { Command } from '../../../discord/types.js';
import { getTargetUser } from '../../../discord/utils/get-target-user.js';
import { findOrCreatePlayer } from '../../player/service.js';

export const shipCommand: Command = {
  name: 'ship',
  async handler(message) {
    const user = getTargetUser(message);
    const { player } = await findOrCreatePlayer(user.id, user.username);
    const view = await buildMenuView('ship', player.id);
    await message.reply(view);
  },
};
