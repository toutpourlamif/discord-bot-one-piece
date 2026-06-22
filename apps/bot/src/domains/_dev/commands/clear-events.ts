import { db } from '@one-piece/db';

import { ValidationError } from '../../../discord/errors.js';
import type { Command } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/build-op-embed.js';
import { pluralize } from '../../../shared/pluralize.js';
import { getNowBucketId } from '../../event/engine/bucket.js';
import * as eventRepository from '../../event/repository.js';
import { resolveTargetPlayer } from '../../player/index.js';
import * as playerRepository from '../../player/repository.js';

export const clearEventsCommand: Command = {
  names: { fr: 'clear-events', en: 'clear-events' },
  aliases: { fr: ['clearevents', 'ce'], en: ['clearevents', 'ce'] },
  async handler(ctx) {
    const { targetPlayer, rest } = await resolveTargetPlayer(ctx);
    // TODO: remplacer cet usage hardcodé par l'util de formatage commande + préfixe + langue de guilde.
    if (rest.length > 0) throw new ValidationError('Usage: `!clearevents [@joueur]`');

    const result = await db.transaction(async (tx) => {
      const player = await playerRepository.findByIdOrThrow(targetPlayer.id, tx, { forUpdate: true });
      const bucketId = getNowBucketId();
      const deletedEventCount = await eventRepository.deletePendingEventsForPlayer(player.id, tx);

      await playerRepository.setLastProcessedBucketId(player.id, bucketId, tx);

      return { bucketId, deletedEventCount, playerName: player.name };
    });

    await ctx.message.reply({
      embeds: [
        buildOpEmbed('success').setDescription(
          [
            `**${result.playerName}** - ${pluralize(result.deletedEventCount, 'event pending supprimé', 'events pending supprimés')}.`,
            `Resynchronisé sur le bucket **${result.bucketId}**.`,
          ].join('\n'),
        ),
      ],
    });
  },
};
