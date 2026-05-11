import type { Player } from '@one-piece/db';
import type { Message } from 'discord.js';

import { buildOpEmbed } from '../../discord/utils/build-op-embed.js';

import { getEndDateOfBucket } from './engine/bucket.js';
import { synchronizePlayer } from './engine/synchronize-player.js';
import { OutOfSyncError } from './errors.js';

const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;

function pluralize(value: number, singular: string, plural: string): string {
  return `${value} ${value === 1 ? singular : plural}`;
}

function getDayPeriod(date: Date): string {
  const hour = date.getHours();

  if (hour >= 5 && hour <= 11) return 'matin';
  if (hour >= 12 && hour <= 17) return "dans l'après-midi";
  if (hour >= 18 && hour <= 22) return 'dans la soirée';
  return 'dans la nuit';
}

function formatElapsedTime(since: Date): string {
  const elapsedMs = Math.max(0, Date.now() - since.getTime());

  if (elapsedMs < HOUR_MS) {
    const elapsedMinutes = Math.max(1, Math.floor(elapsedMs / MINUTE_MS));
    return `depuis ${pluralize(elapsedMinutes, 'minute', 'minutes')}`;
  }

  if (elapsedMs < DAY_MS) {
    const elapsedHours = Math.floor(elapsedMs / HOUR_MS);
    return `depuis ${pluralize(elapsedHours, 'heure', 'heures')}`;
  }

  if (elapsedMs < WEEK_MS) {
    const elapsedDays = Math.floor(elapsedMs / DAY_MS);
    const period = getDayPeriod(since);
    return elapsedDays === 1 ? `depuis hier ${period}` : `depuis ${pluralize(elapsedDays, 'jour', 'jours')}, ${period}`;
  }

  const longAwayPhrases = [
    'depuis une longue traversée loin des regards',
    "depuis le retour d'une longue absence en mer",
    "depuis des jours d'aventure aux confins de Grand Line",
    "depuis un vieux récit rapporté par l'équipage",
  ];
  const phraseIndex = Math.floor(since.getTime() / DAY_MS) % longAwayPhrases.length;
  return longAwayPhrases[phraseIndex]!;
}

export async function autoSyncBeforeAction(message: Message, player: Player): Promise<void> {
  const result = await synchronizePlayer(player.id);

  if (result.status === 'blocked_on_interactive') {
    throw new OutOfSyncError(message.author.id);
  }

  if (result.status === 'caught_up' && result.generatedPassiveCount > 0) {
    const since = getEndDateOfBucket(player.lastProcessedBucketId);
    const elapsed = formatElapsedTime(since);
    const eventCount = pluralize(result.generatedPassiveCount, 'événement', 'événements');

    await message.reply({
      embeds: [
        buildOpEmbed('info').setDescription(
          // TODO: remplacer par le préfixe de la guild
          `📜 Ton équipage a vécu ${eventCount} ${elapsed}. Tape \`!recap\` pour les revivre.`,
        ),
      ],
    });
  }
}
