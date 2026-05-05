import type { Command } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/index.js';
import { findOrCreatePlayer } from '../../player/service.js';
import { ShipNameValidationError } from '../service.js';
import { renameShip } from '../service.js';

export const renameShipCommand: Command = {
  name: 'renameship',
  async handler(message, args) {
    try {
      const { player } = await findOrCreatePlayer(message.author.id, message.author.username, message.guildId!);
      const renamed = await renameShip(player.id, args.join(' '));

      const embed = buildOpEmbed().setTitle('Bateau renommé !').setDescription(`Ton bateau s'appelle maintenant **${renamed.name}**.`);
      await message.reply({
        embeds: [embed],
      });
    } catch (err) {
      if (err instanceof ShipNameValidationError) {
        await message.reply(err.message);
        return;
      }
      throw err;
    }
  },
};
