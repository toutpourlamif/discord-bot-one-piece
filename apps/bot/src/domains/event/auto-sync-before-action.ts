import type { Player } from '@one-piece/db';
import type { Message } from 'discord.js';

import { buildOpEmbed } from '../../discord/utils/build-op-embed.js';

import { getEndDateOfBucket } from './engine/bucket.js';
import { synchronizePlayer } from './engine/synchronize-player.js';
import { OutOfSyncError } from './errors.js';

const HOUR_MS = 60 * 60 * 1000;

function formatElapsedHours(since: Date): string {
  const elapsedHours = Math.max(0, Math.floor((Date.now() - since.getTime()) / HOUR_MS));
  return `${elapsedHours} heure${elapsedHours === 1 ? '' : 's'}`;
}

export async function autoSyncBeforeAction(message: Message, player: Player): Promise<void> {
  const result = await synchronizePlayer(player.id);

  if (result.status === 'blocked_on_interactive') {
    throw new OutOfSyncError(message.author.id);
  }

  if (result.status === 'caught_up' && result.generatedPassiveCount > 0) {
    const since = getEndDateOfBucket(player.lastProcessedBucketId);
    const elapsed = formatElapsedHours(since);

    await message.reply({
      embeds: [
        buildOpEmbed('info').setDescription(
          // TODO: remplacer par le préfixe de la guild
          `📜 Ton équipage a vécu ${result.generatedPassiveCount} événement(s) depuis ${elapsed}. Tape \`!recap\` pour les revivre.`,
        ),
      ],
    });
  }
}
