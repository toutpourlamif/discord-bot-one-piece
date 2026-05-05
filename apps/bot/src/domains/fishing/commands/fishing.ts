import type { Command } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/index.js';
import { resolveTargetPlayer } from '../../player/index.js';
import { runFishingAttempt } from '../service.js';

export const fishingCommand: Command = {
  name: ['fishing', 'fish'],
  async handler(ctx) {
    const targetPlayer = await resolveTargetPlayer(ctx);
    const result = await runFishingAttempt(targetPlayer.id);

    const embed = buildOpEmbed()
      .setTitle('🎣 Pêche')
      .setDescription(`${targetPlayer.name} a pêché ${result.quantity}x **${result.resourceName}** !`);
    await ctx.message.reply({ embeds: [embed] });
  },
};
