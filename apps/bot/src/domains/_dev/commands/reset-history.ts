import { db } from '@one-piece/db';

import type { Command } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/index.js';
import * as historyRepository from '../../history/repository.js';
import { resolveTargetPlayer } from '../../player/index.js';

export const resetHistoryCommand: Command = {
  name: ['resetHistory', 'reset-history'],
  async handler(ctx) {
    const { targetPlayer } = await resolveTargetPlayer(ctx);

    const wipedCount = await db.transaction(async (tx) => {
      const count = await historyRepository.wipeHistoryForPlayer(targetPlayer.id, tx);

      await historyRepository.appendHistory({
        type: 'dev.history_reset',
        actorPlayerId: undefined,
        target: { type: 'player', id: targetPlayer.id },
        payload: { wipedCount: count },
        client: tx,
      });

      return count;
    });

    await ctx.message.reply({
      embeds: [buildOpEmbed('success').setDescription(`History de ${targetPlayer.name} wipée (${wipedCount} entrées).`)],
    });
  },
};
