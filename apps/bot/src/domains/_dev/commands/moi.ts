import type { Command } from '../../../discord/types.js';
import { buildOpEmbed, resolveTargetUser } from '../../../discord/utils/index.js';

// TODO: supprimer avant la prod
export const moiCommand: Command = {
  name: 'moi',
  async handler({ message }) {
    const user = resolveTargetUser(message);
    const embed = buildOpEmbed()
      .setAuthor({
        name: user.username,
        iconURL: user.displayAvatarURL(),
      })
      .setImage(user.displayAvatarURL())
      .setTitle(user.username);
    await message.reply({ embeds: [embed] });
  },
};
