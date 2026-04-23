import type { Command } from '../../../shared/command.js';
import { createOpEmbed } from '../../../shared/embed/create-op-embed.js';

// TODO: supprimer avant la prod
export const moiCommand: Command = {
  name: 'moi',
  async handler(message) {
    const targetUser = message.mentions.users.first();
    const user = targetUser ?? message.author;
    const embed = createOpEmbed()
      .setAuthor({
        name: user.username,
        iconURL: user.displayAvatarURL(),
      })
      .setImage(user.displayAvatarURL())
      .setTitle(user.username);
    await message.reply({ embeds: [embed] });
  },
};
