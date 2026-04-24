import { createOpEmbed } from '../../../discord/embed/create-op-embed.js';
import type { Command } from '../../../discord/types.js';
import { PlayerNameValidationError } from '../name.js';
import { findOrCreatePlayer, renamePlayer } from '../service.js';

export const renameCommand: Command = {
  name: 'rename',
  async handler(message, args) {
    try {
      const { player } = await findOrCreatePlayer(message.author.id, message.author.username);
      const renamed = await renamePlayer(player.id, args.join(' '));
      const embed = createOpEmbed().setDescription(`Tu t'appelles maintenant ${renamed.name}.`);
      await message.reply({ embeds: [embed] });
    } catch (err) {
      if (err instanceof PlayerNameValidationError) {
        await message.reply(err.message);
        return;
      }

      throw err;
    }
  },
};
