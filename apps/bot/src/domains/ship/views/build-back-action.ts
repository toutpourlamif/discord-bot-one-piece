import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import { PAGINATION } from '../../../discord/constants.js';
import { buildCustomId } from '../../../discord/utils/index.js';
import { UPGRADE_SHIP_BUTTON_NAME } from '../constants.js';

export function buildBackAction(playerId: number, ownerDiscordId: string): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(buildCustomId(UPGRADE_SHIP_BUTTON_NAME, ownerDiscordId, playerId))
      .setLabel(PAGINATION.previous.label)
      .setEmoji(PAGINATION.previous.emoji)
      .setStyle(ButtonStyle.Secondary),
  );
}
