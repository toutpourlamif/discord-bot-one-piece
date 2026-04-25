import type { Command } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/build-op-embed.js';
import { getTargetUser } from '../../../discord/utils/get-target-user.js';

// TODO: supprimer avant la prod
export const moiCommand: Command = {
  name: 'moi',
  async handler(message) {
    const user = getTargetUser(message);
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
