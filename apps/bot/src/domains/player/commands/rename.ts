import type { Command } from '../../../discord/types.js';
import { renamePlayer } from '../service.js';

export const renameCommand: Command = {
  name: 'rename',
  async handler({ message, args, player }) {
    const renamed = await renamePlayer(player.id, args.join(' '));
    await message.reply({
      content: `Tu t'appelles maintenant ${renamed.name}.`,
      allowedMentions: { parse: [] },
    });
  },
};
