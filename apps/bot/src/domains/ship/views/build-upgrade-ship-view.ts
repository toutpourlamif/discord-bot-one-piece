import { SHIP_MODULE_KEYS, SHIP_MODULE_LEVEL_COLUMNS, type Ship } from '@one-piece/db';
import type { EmbedBuilder } from 'discord.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import type { View } from '../../../discord/types.js';
import { buildCustomId, buildOpEmbed } from '../../../discord/utils/index.js';
import { UPGRADE_MODULE_EMOJI, UPGRADE_SHIP_MODULE_BUTTON_NAME } from '../constants.js';
import { SHIP_MODULE_LABELS } from '../modules.js';
import { findByPlayerIdOrThrow } from '../repository.js';

export async function buildUpgradeShipView(playerId: number, ownerDiscordId: string): Promise<View> {
  const ship = await findByPlayerIdOrThrow(playerId);

  return {
    embeds: [buildUpgradeShipEmbed(ship.name)],
    components: [buildUpgradeShipModuleButtons(playerId, ownerDiscordId, ship)],
  };
}

function buildUpgradeShipEmbed(shipName: string): EmbedBuilder {
  return buildOpEmbed().setTitle(`${UPGRADE_MODULE_EMOJI} Améliorer ${shipName}`).setDescription('Choisis un module à améliorer.');
}

function buildUpgradeShipModuleButtons(playerId: number, ownerDiscordId: string, ship: Ship): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    ...SHIP_MODULE_KEYS.map((key) => {
      const level = ship[SHIP_MODULE_LEVEL_COLUMNS[key]];

      return new ButtonBuilder()
        .setCustomId(buildCustomId(UPGRADE_SHIP_MODULE_BUTTON_NAME, ownerDiscordId, playerId, key))
        .setLabel(`${SHIP_MODULE_LABELS[key]} (Lv ${level})`)
        .setStyle(ButtonStyle.Secondary);
    }),
  );
}
