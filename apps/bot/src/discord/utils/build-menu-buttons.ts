import type { ButtonBuilder } from 'discord.js';
import { ActionRowBuilder } from 'discord.js';

import { CREW_BUTTON_NAME } from '../../domains/crew/constants.js';
import { buildCrewNavButton } from '../../domains/crew/utils/build-crew-nav-button.js';
import { PROFIL_BUTTON_NAME } from '../../domains/player/constants.js';
import { buildProfilButton } from '../../domains/player/profil-button.js';
import { INVENTORY_BUTTON_NAME } from '../../domains/resource/constants.js';
import { buildInventoryNavButton } from '../../domains/resource/inventory-nav-button.js';
import { SHIP_BUTTON_NAME } from '../../domains/ship/constants.js';
import { buildShipButton } from '../../domains/ship/ship-button.js';

/** Build un ActionRow pour naviguer entre les menus principaux (Profil / Navire / Inventaire / Équipage).
 *  Le bouton de la vue courante est disabled. */
export function buildMenuButtons(currentKey: string, ownerDiscordId: string, playerId: number): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    buildProfilButton(ownerDiscordId, playerId, { disabled: currentKey === PROFIL_BUTTON_NAME }),
    buildShipButton(ownerDiscordId, playerId, { disabled: currentKey === SHIP_BUTTON_NAME }),
    buildInventoryNavButton(ownerDiscordId, playerId, { disabled: currentKey === INVENTORY_BUTTON_NAME }),
    buildCrewNavButton(ownerDiscordId, playerId, { disabled: currentKey === CREW_BUTTON_NAME }),
  );
}
