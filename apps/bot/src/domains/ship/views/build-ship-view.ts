import { SHIP_MODULE_KEYS, SHIP_MODULE_LEVEL_COLUMNS, ZONE_LABELS, type Player } from '@one-piece/db';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type APIEmbedField, type AttachmentBuilder } from 'discord.js';

import type { View } from '../../../discord/types.js';
import { attachImage, buildCustomId, buildDiscordTimestamp, buildMenuButtons, buildOpEmbed } from '../../../discord/utils/index.js';
import { getStartDateOfBucket } from '../../event/engine/bucket.js';
import { buildShipCard } from '../cards/build-ship-card.js';
import { SHIP_BUTTON_NAME, UPGRADE_MODULE_EMOJI, UPGRADE_SHIP_BUTTON_NAME } from '../constants.js';
import { SHIP_MODULE_LABELS, SHIP_MODULES } from '../modules.js';
import { findByPlayerIdOrThrow } from '../repository.js';

export async function buildShipView(player: Player, ownerDiscordId: string): Promise<View> {
  const ship = await findByPlayerIdOrThrow(player.id);

  const embed = buildOpEmbed().setTitle(`🚢 ${ship.name}`);
  embed.addFields(...buildLocationFields(player));

  const files: Array<AttachmentBuilder> = [];
  attachImage({ embed, files, image: await buildShipCard(player, ship) });
  // TODO: Redesign this shit
  for (const key of SHIP_MODULE_KEYS) {
    const level = ship[SHIP_MODULE_LEVEL_COLUMNS[key]];
    const value = SHIP_MODULES[key].valueByLevel[level - 1];
    embed.addFields({
      name: `${SHIP_MODULE_LABELS[key]} (niveau ${level})`,
      value: value !== undefined ? String(value) : '—',
      inline: true,
    });
  }

  const navRow = buildMenuButtons(SHIP_BUTTON_NAME, ownerDiscordId, player);
  const isOwner = player.discordId === ownerDiscordId;
  const upgradeRow = isOwner ? buildUpgradeShipButtonRow(player.id, ownerDiscordId) : null;

  return { embeds: [embed], components: upgradeRow ? [upgradeRow, navRow] : [navRow], files };
}

function buildLocationFields(player: Player): Array<APIEmbedField> {
  const positionField: APIEmbedField = { name: '📍 Position', value: ZONE_LABELS[player.currentZone], inline: true };
  if (player.travelTargetZone === null || player.travelEtaBucket === null) {
    return [positionField];
  }
  const arrivalAt = getStartDateOfBucket(player.travelEtaBucket);
  return [
    positionField,
    {
      name: '🚢 Destination',
      value: `${ZONE_LABELS[player.travelTargetZone]}(Arrivée prévue dans ~${buildDiscordTimestamp(arrivalAt)})`,
      inline: true,
    },
  ];
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
