import { ButtonBuilder, ButtonStyle } from 'discord.js';

import { buildCustomId } from '../../discord/utils/index.js';
import { DOMAIN_EMOJI } from '../../shared/domains.js';

import { CHARACTERS_BUTTON_NAME } from './constants.js';

const FIRST_PAGE = 0;

export function buildCharactersNavButton(playerId: number, options?: { disabled?: boolean }): ButtonBuilder {
  const disabled = options?.disabled ?? false;
  return (
    new ButtonBuilder()
      // 'menu-characters-disabled' (la valeur importe peu) sinon la page 0 a le même id que le bouton du menu et discord interdit les doublons d'id
      .setCustomId(disabled ? `menu-characters-disabled` : buildCustomId(CHARACTERS_BUTTON_NAME, playerId, FIRST_PAGE))
      .setLabel('Personnages')
      .setEmoji(DOMAIN_EMOJI.character)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disabled)
  );
}
