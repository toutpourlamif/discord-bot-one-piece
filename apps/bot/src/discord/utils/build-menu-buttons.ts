import type { ButtonBuilder } from 'discord.js';
import { ActionRowBuilder } from 'discord.js';

import { buildCharactersNavButton } from '../../domains/character/characters-nav-button.js';
import { CHARACTERS_BUTTON_NAME } from '../../domains/character/constants.js';
import { PROFIL_BUTTON_NAME } from '../../domains/player/constants.js';
import { buildProfilButton } from '../../domains/player/profil-button.js';
import { INVENTORY_BUTTON_NAME } from '../../domains/resource/constants.js';
import { buildInventoryNavButton } from '../../domains/resource/inventory-nav-button.js';
import { SHIP_BUTTON_NAME } from '../../domains/ship/constants.js';
import { buildShipButton } from '../../domains/ship/ship-button.js';

/** Build un ActionRow pour naviguer entre les menus principaux (Profil / Navire / Inventaire / Personnages).
 *  Le bouton de la vue courante est disabled. */
export function buildMenuButtons(currentKey: string, ownerDiscordId: string, playerId: number): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    buildProfilButton(ownerDiscordId, playerId, { disabled: currentKey === PROFIL_BUTTON_NAME }),
    buildShipButton(ownerDiscordId, playerId, { disabled: currentKey === SHIP_BUTTON_NAME }),
    buildInventoryNavButton(ownerDiscordId, playerId, { disabled: currentKey === INVENTORY_BUTTON_NAME }),
    buildCharactersNavButton(ownerDiscordId, playerId, { disabled: currentKey === CHARACTERS_BUTTON_NAME }),
  );
}
