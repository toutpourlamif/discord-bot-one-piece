import { EmbedBuilder } from 'discord.js';

import type { Command } from '../../../shared/command.js';

// TODO: supprimer avant la prod
export const moiCommand: Command = {
  name: 'moi',
  async handler(message) {
    // TODO: remplacer par helper
    const targetUser = message.mentions.users.first();
    const user = targetUser ?? message.author;
    const embed = new EmbedBuilder()
      .setAuthor({
        name: user.username,
        iconURL: user.displayAvatarURL(),
      })
      .setImage(user.displayAvatarURL())
      .setTitle(user.username);
    await message.reply({ embeds: [embed] });
  },
};
