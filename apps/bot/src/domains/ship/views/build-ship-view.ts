import { ZONE_LABELS, type Player } from '@one-piece/db';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type AttachmentBuilder } from 'discord.js';

import type { View } from '../../../discord/types.js';
import { attachImage, buildCustomId, buildDiscordTimestamp, buildMenuButtons, buildOpEmbed } from '../../../discord/utils/index.js';
import { getStartDateOfBucket } from '../../event/engine/bucket.js';
import { isInTravel } from '../../navigation/utils/index.js';
import { buildShipCard } from '../cards/build-ship-card.js';
import { SHIP_BUTTON_NAME, UPGRADE_MODULE_EMOJI, UPGRADE_SHIP_BUTTON_NAME } from '../constants.js';
import { findByPlayerIdOrThrow } from '../repository.js';

export async function buildShipView(player: Player, ownerDiscordId: string): Promise<View> {
  const ship = await findByPlayerIdOrThrow(player.id);

  const embed = buildOpEmbed().setTitle(`${ship.name}`);
  embed.addFields({ name: '📍 Position', value: ZONE_LABELS[player.currentZone], inline: true });
  if (isInTravel(player)) {
    const arrivalAt = getStartDateOfBucket(player.travelEtaBucket);
    embed.addFields({
      name: '🚢 Destination',
      value: `${ZONE_LABELS[player.travelTargetZone]} — arrivée ${buildDiscordTimestamp(arrivalAt)}`,
      inline: true,
    });
  }

  const files: Array<AttachmentBuilder> = [];
  attachImage({ embed, files, image: await buildShipCard(player, ship) });

  const navRow = buildMenuButtons(SHIP_BUTTON_NAME, ownerDiscordId, player);
  const isOwner = player.discordId === ownerDiscordId;
  const upgradeRow = isOwner ? buildUpgradeShipButtonRow(player.id, ownerDiscordId) : null;

  return { embeds: [embed], components: upgradeRow ? [upgradeRow, navRow] : [navRow], files };
}

function buildUpgradeShipButtonRow(playerId: number, ownerDiscordId: string): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(buildCustomId(UPGRADE_SHIP_BUTTON_NAME, ownerDiscordId, playerId))
      .setLabel('Améliorer')
      .setEmoji(UPGRADE_MODULE_EMOJI)
      .setStyle(ButtonStyle.Secondary),
  );
}
