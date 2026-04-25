import { ButtonBuilder, ButtonStyle } from 'discord.js';

import { buildCustomId } from '../../discord/utils/build-custom-id.js';

import { SHIP_BUTTON_NAME } from './constants.js';

export function buildShipButton(playerId: number, options?: { disabled?: boolean }): ButtonBuilder {
  return new ButtonBuilder()
    .setCustomId(buildCustomId(SHIP_BUTTON_NAME, playerId))
    .setLabel('Navire')
    .setEmoji('🚢')
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(options?.disabled ?? false);
}
