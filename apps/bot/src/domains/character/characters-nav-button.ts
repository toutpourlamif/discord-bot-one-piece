import { ButtonBuilder, ButtonStyle } from 'discord.js';

import { buildCustomId } from '../../discord/utils/index.js';
import { DOMAIN_EMOJI } from '../../shared/domains.js';

import { CHARACTERS_BUTTON_NAME } from './constants.js';

const FIRST_PAGE = 0;

export function buildCharactersNavButton(playerId: number, options?: { disabled?: boolean }): ButtonBuilder {
  return new ButtonBuilder()
    .setCustomId(buildCustomId(CHARACTERS_BUTTON_NAME, playerId, FIRST_PAGE))
    .setLabel('Personnages')
    .setEmoji(DOMAIN_EMOJI.character)
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(options?.disabled ?? false);
}
