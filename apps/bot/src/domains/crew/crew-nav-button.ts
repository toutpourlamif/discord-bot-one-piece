import { ButtonBuilder, ButtonStyle } from 'discord.js';

import { buildCustomId } from '../../discord/utils/build-custom-id.js';
import { DOMAIN_EMOJI } from '../../shared/domains.js';

import { CREW_BUTTON_NAME } from './constants.js';

const FIRST_PAGE = 0;

export function buildCrewNavButton(playerId: number, options?: { disabled?: boolean }): ButtonBuilder {
  return new ButtonBuilder()
    .setCustomId(buildCustomId(CREW_BUTTON_NAME, playerId, FIRST_PAGE))
    .setLabel('Équipage')
    .setEmoji(DOMAIN_EMOJI.character)
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(options?.disabled ?? false);
}
