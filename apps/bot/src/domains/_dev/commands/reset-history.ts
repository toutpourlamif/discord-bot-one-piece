import type { Command } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/index.js';
import { wipeHistoryForPlayer } from '../../history/index.js';
import { resolveTargetPlayer } from '../../player/index.js';

export const resetHistoryCommand: Command = {
  name: ['resetHistory', 'reset-history', 'rh'],
  async handler(ctx) {
    const { targetPlayer } = await resolveTargetPlayer(ctx);
    const wipedCount = await wipeHistoryForPlayer(targetPlayer.id);

    await ctx.message.reply({
      embeds: [buildOpEmbed('success').setDescription(`History de ${targetPlayer.name} wipée (${wipedCount} entrées).`)],
    });
  },
};
