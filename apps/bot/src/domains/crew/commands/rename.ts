import type { Command } from '../../../discord/types.js';
import { buildOpEmbed, getQuery } from '../../../discord/utils/index.js';
import { MIN_CREW_NAME_LENGTH } from '../constants.js';
import { renameCrew } from '../service.js';
import { getCrewDisplayName } from '../utils/get-crew-display-name.js';

export const renameCrewCommand: Command = {
  name: 'renamecrew',
  async handler({ message, args, player }) {
    const name = getQuery(args, { emptyMessage: 'Tu dois donner un nom.', minLength: MIN_CREW_NAME_LENGTH });
    const renamed = await renameCrew(player.id, name);

    const embed = buildOpEmbed()
      .setTitle('Équipage renommé !')
      .setDescription(`Ton équipage s'appelle maintenant **${getCrewDisplayName(renamed)}**.`);
    await message.reply({
      embeds: [embed],
    });
  },
};
