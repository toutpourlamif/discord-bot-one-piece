import type { Message } from 'discord.js';

import { buildOpEmbed } from '../../discord/utils/build-op-embed.js';

import { synchronizePlayer } from './engine/synchronize-player.js';
import { OutOfSyncError } from './errors.js';

export async function autoSyncBeforeAction(message: Message, playerId: number): Promise<void> {
  const result = await synchronizePlayer(playerId);

  if (result.status === 'blocked_on_interactive') {
    throw new OutOfSyncError(message.author.id);
  }

  if (result.status === 'caught_up' && result.generatedPassiveCount > 0) {
    await message.reply({
      embeds: [
        buildOpEmbed('info').setDescription(
          // TODO: remplacer par le préfixe de la guild
          `📜 Ton équipage a vécu ${result.generatedPassiveCount} événement(s). Tape \`!recap\` pour les revivre.`,
        ),
      ],
    });
  }
}
