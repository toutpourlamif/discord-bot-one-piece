import { ButtonBuilder, ButtonStyle } from 'discord.js';

import { buildCustomId } from '../../discord/utils/index.js';

import { TAVERN_BUTTON_NAME } from './constants.js';

export function buildTavernButton(ownerDiscordId: string, playerId: number, options?: { disabled?: boolean }): ButtonBuilder {
  return new ButtonBuilder()
    .setCustomId(buildCustomId(TAVERN_BUTTON_NAME, ownerDiscordId, playerId))
    .setLabel('Taverne')
    .setEmoji('🍺')
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(options?.disabled ?? false);
}
