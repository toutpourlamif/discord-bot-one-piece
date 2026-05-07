import { SHIP_MODULE_KEYS, SHIP_MODULE_LEVEL_COLUMNS, type Ship } from '@one-piece/db';
import type { EmbedBuilder } from 'discord.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import chunk from 'lodash/chunk.js';

import type { View } from '../../../discord/types.js';
import { buildBackButton, buildCustomId, buildOpEmbed } from '../../../discord/utils/index.js';
import { SHIP_BUTTON_NAME, UPGRADE_MODULE_EMOJI, UPGRADE_SHIP_MODULE_BUTTON_NAME } from '../constants.js';
import { SHIP_MODULE_LABELS } from '../modules.js';
import { findByPlayerIdOrThrow } from '../repository.js';

export async function buildUpgradeShipView(playerId: number, ownerDiscordId: string): Promise<View> {
  const ship = await findByPlayerIdOrThrow(playerId);

  return {
    embeds: [buildUpgradeShipEmbed(ship.name)],
    components: buildUpgradeShipRows(playerId, ownerDiscordId, ship),
  };
}

function buildUpgradeShipEmbed(shipName: string): EmbedBuilder {
  return buildOpEmbed().setTitle(`${UPGRADE_MODULE_EMOJI} Améliorer ${shipName}`).setDescription('Choisis un module à améliorer.');
}

function buildUpgradeShipRows(playerId: number, ownerDiscordId: string, ship: Ship): Array<ActionRowBuilder<ButtonBuilder>> {
  const buttons = [
    buildBackButton(buildCustomId(SHIP_BUTTON_NAME, ownerDiscordId, playerId)),
    ...SHIP_MODULE_KEYS.map((key) => {
      const level = ship[SHIP_MODULE_LEVEL_COLUMNS[key]];
      return new ButtonBuilder()
        .setCustomId(buildCustomId(UPGRADE_SHIP_MODULE_BUTTON_NAME, ownerDiscordId, playerId, key))
        .setLabel(`${SHIP_MODULE_LABELS[key]} (Lv ${level})`)
        .setStyle(ButtonStyle.Secondary);
    }),
  ];

  // vu qu'on a 5 pour items, + le bouton "Précédent", on fait 2 lignes de 3
  return chunk(buttons, 3).map((rowButtons) => new ActionRowBuilder<ButtonBuilder>().addComponents(rowButtons));
}
