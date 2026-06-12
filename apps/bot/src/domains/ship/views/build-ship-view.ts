import { ZONE_LABELS, type Player } from '@one-piece/db';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type APIEmbedField, type AttachmentBuilder } from 'discord.js';

import type { View } from '../../../discord/types.js';
import { attachImage, buildCustomId, buildDiscordTimestamp, buildMenuButtons, buildOpEmbed } from '../../../discord/utils/index.js';
import { getStartDateOfBucket } from '../../event/engine/bucket.js';
import { buildShipCard } from '../cards/build-ship-card.js';
import { SHIP_BUTTON_NAME, UPGRADE_MODULE_EMOJI, UPGRADE_SHIP_BUTTON_NAME } from '../constants.js';
import { SHIP_MODULES } from '../modules.js';
import { findByPlayerIdOrThrow } from '../repository.js';

export async function buildShipView(player: Player, ownerDiscordId: string): Promise<View> {
  const ship = await findByPlayerIdOrThrow(player.id);

  const embed = buildOpEmbed().setTitle(`🚢 ${ship.name}`);
  embed.addFields(...buildLocationFields(player));

  const maxHp = SHIP_MODULES.hull.valueByLevel[ship.hullLevel - 1] ?? 100;
  const hpRatio = Math.min(Math.max(ship.hp / maxHp, 0), 1);
  embed.addFields({ name: 'HP', value: `${buildHpBar(hpRatio)} ${ship.hp}/${maxHp}`, inline: false });

  const files: Array<AttachmentBuilder> = [];
  attachImage({ embed, files, image: await buildShipCard(player) });

  const navRow = buildMenuButtons(SHIP_BUTTON_NAME, ownerDiscordId, player);
  const isOwner = player.discordId === ownerDiscordId;
  const upgradeRow = isOwner ? buildUpgradeShipButtonRow(player.id, ownerDiscordId) : null;

  return { embeds: [embed], components: upgradeRow ? [upgradeRow, navRow] : [navRow], files };
}

function buildHpBar(ratio: number): string {
  const filled = ratio === 0 ? 0 : Math.max(1, Math.round(ratio * 10));
  const color = ratio > 0.5 ? '🟩' : ratio > 0.25 ? '🟧' : '🟥';
  return color.repeat(filled) + '⬜'.repeat(10 - filled);
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
