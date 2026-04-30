import { ButtonBuilder, ButtonStyle } from 'discord.js';

import { buildCustomId } from '../../discord/utils/index.js';

import { SHIP_BUTTON_NAME } from './constants.js';

export function buildShipButton(ownerDiscordId: string, playerId: number, options?: { disabled?: boolean }): ButtonBuilder {
  return new ButtonBuilder()
    .setCustomId(buildCustomId(SHIP_BUTTON_NAME, ownerDiscordId, playerId))
    .setLabel('Navire')
    .setEmoji('🚢')
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(options?.disabled ?? false);
}
