import { db, type Player } from '@one-piece/db';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import { PAGINATION } from '../../../discord/constants.js';
import type { View } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/index.js';
import { buildProfilButton } from '../../player/build-profil-button.js';
import { getNowBucketId, getStartDateOfBucket } from '../engine/bucket.js';
import { buildGeneratorContext, fetchGeneratorContextData } from '../engine/context-builders.js';
import { findGeneratorByKeyOrThrow } from '../generators/registry.js';
import { getPendingEventsForPlayer, type PendingEventInstance } from '../repository.js';
import type { GeneratorContext, InteractiveGenerator, PassiveGenerator } from '../types.js';
import { buildEventPassiveNextCustomId } from '../utils/build-event-custom-id.js';

import { buildInteractiveStepView } from './build-interactive-step-view.js';
import { getRandomCalmTextByZone } from './get-random-calm-text-by-zone.js';

export async function buildRecapView(player: Player, isContinuation = false): Promise<View> {
  const pendingEvents = await getPendingEventsForPlayer(player.id);
  const firstPendingEvent = pendingEvents[0];
  if (!firstPendingEvent) {
    return buildEmptyView(player, isContinuation);
  }

  const generator = findGeneratorByKeyOrThrow(firstPendingEvent.eventKey);

  if (!generator.isInteractive) {
    return buildPassiveView(generator, firstPendingEvent);
  }
  return buildInteractiveView(generator, firstPendingEvent, player);
}

function buildEmptyView(player: Player, isContinuation: boolean): View {
  const profilRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    buildProfilButton(player.discordId, player.id, { label: 'Voir mon profil' }),
  );
  const title = isContinuation ? "Plus d'évènements à consulter !" : "Aucun évènement à consulter pour l'instant.";
  return {
    embeds: [
      buildOpEmbed('info')
        .setTitle(title)
        .setDescription(`*${getRandomCalmTextByZone(player.currentZone)}*`),
    ],
    components: [profilRow],
  };
}

function buildPassiveView(generator: PassiveGenerator, instance: PendingEventInstance): View {
  const embed = generator.render(instance.state).setTimestamp(getStartDateOfBucket(instance.bucketId));
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(buildEventPassiveNextCustomId(instance.id))
      .setEmoji(PAGINATION.next.emoji)
      .setLabel(PAGINATION.next.label)
      .setStyle(ButtonStyle.Primary),
  );
  return { embeds: [embed], components: [row] };
}

async function buildInteractiveView(generator: InteractiveGenerator, instance: PendingEventInstance, player: Player): Promise<View> {
  const ctx = await buildCtxForPlayer(player);
  return buildInteractiveStepView({ generator, instanceId: instance.id, state: instance.state, bucketId: instance.bucketId, ctx });
}

async function buildCtxForPlayer(player: Player): Promise<GeneratorContext> {
  const ctxData = await db.transaction(async (tx) => fetchGeneratorContextData(player, tx));
  return buildGeneratorContext(ctxData, getNowBucketId());
}
