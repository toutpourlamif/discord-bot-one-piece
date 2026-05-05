import type { Command } from '../../../discord/types.js';
import { buildOpEmbed, getTargetUser } from '../../../discord/utils/index.js';
import { findOrCreatePlayer } from '../../player/service.js';
import { runFishingAttempt } from '../service.js';

export const fishingCommand: Command = {
  name: ['fishing', 'fish'],
  async handler(message) {
    const user = getTargetUser(message);
    const { player } = await findOrCreatePlayer(user.id, user.username, message.guildId!);
    const result = await runFishingAttempt(player.id);

    const embed = buildOpEmbed()
      .setTitle('🎣 Pêche')
      .setDescription(`${player.name} a pêché ${result.quantity}x **${result.resourceName}** !`);
    await message.reply({ embeds: [embed] });
  },
};
