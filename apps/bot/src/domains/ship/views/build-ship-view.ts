import { SHIP_MODULE_KEYS, SHIP_MODULE_LEVEL_COLUMNS } from '@one-piece/db';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import type { View } from '../../../discord/types.js';
import { buildCustomId, buildMenuButtons, buildOpEmbed } from '../../../discord/utils/index.js';
import * as playerRepository from '../../player/repository.js';
import { SHIP_BUTTON_NAME, UPGRADE_MODULE_EMOJI, UPGRADE_SHIP_BUTTON_NAME } from '../constants.js';
import { SHIP_MODULE_LABELS, SHIP_MODULES } from '../modules.js';
import { findByPlayerIdOrThrow } from '../repository.js';

export async function buildShipView(playerId: number, ownerDiscordId: string): Promise<View> {
  const navRow = buildMenuButtons(SHIP_BUTTON_NAME, ownerDiscordId, playerId);
  const ship = await findByPlayerIdOrThrow(playerId);
  const embed = buildOpEmbed().setTitle(`🚢 ${ship.name}`).setDescription(`HP : ${ship.hp}`);
  const player = await playerRepository.findByIdOrThrow(playerId);

  const components = [navRow];

  appendUpgradeShipButton(components, {
    isOwner: player.discordId === ownerDiscordId,
    ownerDiscordId,
    playerId,
  });

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

  return { embeds: [embed], components };
}

type AppendUpgradeShipButtonOptions = {
  isOwner: boolean;
  ownerDiscordId: string;
  playerId: number;
};

function appendUpgradeShipButton(
  components: Array<ActionRowBuilder<ButtonBuilder>>,
  { isOwner, ownerDiscordId, playerId }: AppendUpgradeShipButtonOptions,
): void {
  if (!isOwner) return;

  const upgradeRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(buildCustomId(UPGRADE_SHIP_BUTTON_NAME, ownerDiscordId, playerId))
      .setLabel('Améliorer')
      .setEmoji(UPGRADE_MODULE_EMOJI)
      .setStyle(ButtonStyle.Primary),
  );

  components.unshift(upgradeRow);
}
