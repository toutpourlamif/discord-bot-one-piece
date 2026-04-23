import { EmbedBuilder } from 'discord.js';

import type { Command } from '../../../shared/command.js';
import { findOrCreatePlayer } from '../../player/service.js';
import { findOrCreateShip } from '../service.js';

export const shipCommand: Command = {
  name: 'ship',
  async handler(message) {
    // TODO: remplacer par helper
    const targetUser = message.mentions.users.first();
    const finalUser = targetUser ?? message.author;
    const { player } = await findOrCreatePlayer(finalUser.id, finalUser.username);
    const { ship } = await findOrCreateShip(player.id);
    // TODO: remplacer par CreateOpEmbed un jour ou l'autre
    const embed = new EmbedBuilder().setTitle(ship.name);
    await message.reply({ embeds: [embed] });
  },
};
