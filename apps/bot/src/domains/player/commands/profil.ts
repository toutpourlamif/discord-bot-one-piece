import type { Command } from '../../../discord/types.js';
import { getTargetUser } from '../../../discord/utils/index.js';
import { buildProfilView } from '../profil-view.js';
import { findOrCreatePlayer } from '../service.js';

export const profilCommand: Command = {
  name: 'profil',
  async handler(message) {
    const target = getTargetUser(message);
    const { player } = await findOrCreatePlayer(target.id, target.username);
    await message.reply(await buildProfilView(player.id, message.author.id));
  },
};
