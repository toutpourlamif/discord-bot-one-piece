import type { ButtonBuilder } from 'discord.js';
import { ActionRowBuilder } from 'discord.js';

import { PROFIL_BUTTON_NAME } from '../../domains/player/constants.js';
import { buildProfilButton } from '../../domains/player/profil-button.js';
import { INVENTORY_BUTTON_NAME } from '../../domains/resource/constants.js';
import { buildInventoryNavButton } from '../../domains/resource/inventory-nav-button.js';
import { SHIP_BUTTON_NAME } from '../../domains/ship/constants.js';
import { buildShipButton } from '../../domains/ship/ship-button.js';

/** Build un ActionRow pour naviguer entre les menus principaux (Profil / Navire / Inventaire).
 *  Le bouton de la vue courante est disabled. */
export function buildMenuButtons(currentKey: string, playerId: number): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    buildProfilButton(playerId, { disabled: currentKey === PROFIL_BUTTON_NAME }),
    buildShipButton(playerId, { disabled: currentKey === SHIP_BUTTON_NAME }),
    buildInventoryNavButton(playerId, { disabled: currentKey === INVENTORY_BUTTON_NAME }),
  );
}
