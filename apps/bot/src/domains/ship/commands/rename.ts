import type { Command } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/index.js';
import { renameShip } from '../service.js';

export const renameShipCommand: Command = {
  name: 'renameship',
  async handler({ message, args, player }) {
    const renamed = await renameShip(player.id, args.join(' '));

    const embed = buildOpEmbed().setTitle('Bateau renommé !').setDescription(`Ton bateau s'appelle maintenant **${renamed.name}**.`);
    await message.reply({
      embeds: [embed],
    });
  },
};
