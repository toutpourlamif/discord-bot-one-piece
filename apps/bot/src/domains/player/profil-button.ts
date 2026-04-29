import { ButtonBuilder, ButtonStyle } from 'discord.js';

import { buildCustomId } from '../../discord/utils/build-custom-id.js';

import { PROFIL_BUTTON_NAME } from './constants.js';

export function buildProfilButton(playerId: number, options?: { disabled?: boolean }): ButtonBuilder {
  return new ButtonBuilder()
    .setCustomId(buildCustomId(PROFIL_BUTTON_NAME, playerId))
    .setLabel('Profil')
    .setEmoji('👤')
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(options?.disabled ?? false);
}
