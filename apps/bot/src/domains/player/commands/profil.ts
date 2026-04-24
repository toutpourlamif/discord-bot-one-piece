import { buildMenuView } from '../../../discord/menu/index.js';
import type { Command } from '../../../discord/types.js';
import { getTargetUser } from '../../../discord/utils/get-target-user.js';
import { findOrCreatePlayer } from '../service.js';

export const profilCommand: Command = {
  name: 'profil',
  async handler(message) {
    const target = getTargetUser(message);
    const { player } = await findOrCreatePlayer(target.id, target.username);
    const view = await buildMenuView('profil', player.id);
    await message.reply(view);
  },
};
