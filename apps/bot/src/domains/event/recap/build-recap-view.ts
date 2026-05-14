import { db, type Player } from '@one-piece/db';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import chunk from 'lodash/chunk.js';

import { DISCORD_ACTION_ROW_MAX_BUTTONS, PAGINATION } from '../../../discord/constants.js';
import { InternalError } from '../../../discord/errors.js';
import type { View } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/index.js';
import { buildProfilButton } from '../../player/build-profil-button.js';
import { getNowBucketId } from '../engine/bucket.js';
import { buildGeneratorContext, fetchGeneratorContextData } from '../engine/context-builders.js';
import { findGeneratorByKeyOrThrow } from '../generators/registry.js';
import { getPendingEventsForPlayer, type PendingEventInstance } from '../repository.js';
import type { GeneratorContext, InteractiveGenerator, PassiveGenerator } from '../types.js';
import { buildEventInteractiveChoiceCustomId, buildEventPassiveNextCustomId } from '../utils/build-event-custom-id.js';

import { getRandomCalmTextByZone } from './get-random-calm-text-by-zone.js';

export async function buildRecapView(player: Player): Promise<View> {
  const pendingEvents = await getPendingEventsForPlayer(player.id);
  const firstPendingEvent = pendingEvents[0];
  if (!firstPendingEvent) {
    const profilRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      buildProfilButton(player.discordId, player.id, { label: 'Voir mon profil' }),
    );
    return {
      embeds: [
        buildOpEmbed('info')
          .setTitle(`Vous n'avez aucun évènement à consulter.`)
          .setDescription('Revenez plus tard.')
          .setFooter({ text: getRandomCalmTextByZone(player.currentZone) }),
      ],
      components: [profilRow],
    };
  }

  const generator = findGeneratorByKeyOrThrow(firstPendingEvent.eventKey);

  if (!generator.isInteractive) {
    return buildPassiveView(generator, firstPendingEvent);
  }
  return buildInteractiveView(generator, firstPendingEvent, player);
}

function buildPassiveView(generator: PassiveGenerator, instance: PendingEventInstance): View {
  const embed = generator.render(instance.state);
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
  const stepKey = instance.state.step;
  if (typeof stepKey !== 'string') throw new InternalError(`state.step invalide pour ${generator.key}: ${String(stepKey)}`);
  const step = generator.steps[stepKey];
  if (!step) throw new InternalError(`Step introuvable: ${stepKey} pour ${generator.key}`);

  const ctx = await buildCtxForPlayer(player);
  const embed = step.embed(instance.state, ctx);
  const buttons = step
    .choices(instance.state, ctx)
    .map((choice) =>
      new ButtonBuilder()
        .setCustomId(buildEventInteractiveChoiceCustomId(instance.id, choice.id))
        .setLabel(choice.label)
        .setStyle(ButtonStyle.Primary),
    );
  const rows = chunk(buttons, DISCORD_ACTION_ROW_MAX_BUTTONS).map((rowButtons) =>
    new ActionRowBuilder<ButtonBuilder>().addComponents(rowButtons),
  );
  return { embeds: [embed], components: rows };
}

async function buildCtxForPlayer(player: Player): Promise<GeneratorContext> {
  const ctxData = await db.transaction(async (tx) => fetchGeneratorContextData(player, tx));
  return buildGeneratorContext(ctxData, getNowBucketId());
}
