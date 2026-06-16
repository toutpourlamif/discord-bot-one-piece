import { db } from '@one-piece/db';

import type { Command } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/index.js';
import { resolveTargetPlayer } from '../../player/index.js';
import { runFishingAttempt } from '../service.js';

export const fishingCommand: Command = {
  names: { fr: 'fishing', en: 'fishing' },
  aliases: { fr: 'fish', en: 'fish' },
  async handler(ctx) {
    const { targetPlayer } = await resolveTargetPlayer(ctx);
    const result = await db.transaction(async (tx) => runFishingAttempt(targetPlayer.id, tx));

    const embed = buildOpEmbed()
      .setTitle('🎣 Pêche')
      .setDescription(`${targetPlayer.name} a pêché ${result.quantity}x **${result.resourceName}** !`);
    await ctx.message.reply({ embeds: [embed] });
  },
};
