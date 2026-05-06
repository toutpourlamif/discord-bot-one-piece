import type { Command } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/index.js';
import { renameCrew } from '../service.js';
import { getCrewDisplayName } from '../utils/get-crew-display-name.js';

export const renameCrewCommand: Command = {
  name: 'renamecrew',
  async handler({ message, args, player }) {
    const renamed = await renameCrew(player.id, args.join(' '));

    const embed = buildOpEmbed()
      .setTitle('Équipage renommé !')
      .setDescription(`Ton équipage s'appelle maintenant **${getCrewDisplayName(renamed)}**.`);
    await message.reply({
      embeds: [embed],
    });
  },
};
