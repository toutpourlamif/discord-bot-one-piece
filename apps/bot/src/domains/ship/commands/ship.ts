import { EmbedBuilder } from 'discord.js';

import type { Command } from '../../../shared/command.js';
import { findOrCreatePlayer } from '../../player/service.js';
import { findOrCreateShip } from '../service.js';

export const shipCommand: Command = {
  name: 'ship',
  async handler(message) {
    const { player } = await findOrCreatePlayer(message.author.id, message.author.username);
    const { ship } = await findOrCreateShip(player.id);
    const embed = new EmbedBuilder().setTitle(ship.name);
    await message.reply({ embeds: [embed] });
  },
};
