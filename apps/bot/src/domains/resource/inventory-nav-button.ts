import { ButtonBuilder, ButtonStyle } from 'discord.js';

import { buildCustomId } from '../../discord/utils/build-custom-id.js';

import { INVENTORY_BUTTON_NAME } from './constants.js';

const FIRST_PAGE = 0;

/** Bouton "Inventaire" pour la nav row du menu — ouvre l'inventaire à la page 0 (réutilise le handler de pagination existant). */
export function buildInventoryNavButton(ownerDiscordId: string, playerId: number, options?: { disabled?: boolean }): ButtonBuilder {
  return new ButtonBuilder()
    .setCustomId(buildCustomId(INVENTORY_BUTTON_NAME, ownerDiscordId, playerId, FIRST_PAGE))
    .setLabel('Inventaire')
    .setEmoji('🎒')
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(options?.disabled ?? false);
}
