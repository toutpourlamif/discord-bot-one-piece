import { SHIP_MODULE_KEYS, SHIP_MODULE_LEVEL_COLUMNS, type Player } from '@one-piece/db';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import type { View } from '../../../discord/types.js';
import { buildCustomId, buildMenuButtons, buildOpEmbed } from '../../../discord/utils/index.js';
import { SHIP_BUTTON_NAME, UPGRADE_MODULE_EMOJI, UPGRADE_SHIP_BUTTON_NAME } from '../constants.js';
import { SHIP_MODULE_LABELS, SHIP_MODULES } from '../modules.js';
import { findByPlayerIdOrThrow } from '../repository.js';

export async function buildShipView(player: Player, ownerDiscordId: string): Promise<View> {
  const ship = await findByPlayerIdOrThrow(player.id);

  const embed = buildOpEmbed().setTitle(`🚢 ${ship.name}`).setDescription(`HP : ${ship.hp}`);
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

  const navRow = buildMenuButtons(SHIP_BUTTON_NAME, ownerDiscordId, player.id);
  const isOwner = player.discordId === ownerDiscordId;
  const upgradeRow = isOwner ? buildUpgradeShipButtonRow(player.id, ownerDiscordId) : null;

  return { embeds: [embed], components: upgradeRow ? [upgradeRow, navRow] : [navRow] };
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
