import type { Command } from '../../../discord/types.js';
import { buildOpEmbed, getQuery } from '../../../discord/utils/index.js';
import { renamePlayer } from '../service.js';

export const renameCommand: Command = {
  name: 'rename',
  async handler({ message, args, player }) {
    const name = getQuery(args, { emptyMessage: 'Tu dois donner un nom.' });
    const renamed = await renamePlayer(player.id, name);

    const embed = buildOpEmbed().setTitle('Joueur renommé !').setDescription(`Tu t'appelles maintenant **${renamed.name}**.`);
    await message.reply({ embeds: [embed] });
  },
};
