import type { Player } from '@one-piece/db';
import type { ButtonBuilder } from 'discord.js';
import { ActionRowBuilder } from 'discord.js';

import { CREW_BUTTON_NAME } from '../../domains/crew/constants.js';
import { buildCrewNavButton } from '../../domains/crew/utils/build-crew-nav-button.js';
import { buildProfilButton } from '../../domains/player/build-profil-button.js';
import { PROFIL_BUTTON_NAME } from '../../domains/player/constants.js';
import { INVENTORY_BUTTON_NAME } from '../../domains/resource/constants.js';
import { buildInventoryNavButton } from '../../domains/resource/inventory-nav-button.js';
import { SHIP_BUTTON_NAME } from '../../domains/ship/constants.js';
import { buildShipButton } from '../../domains/ship/ship-button.js';
import { buildTavernButton } from '../../domains/tavern/build-tavern-button.js';
import { getReachableTavern } from '../../domains/tavern/utils/get-reachable-tavern.js';

/** Build un ActionRow pour naviguer entre les menus principaux (Profil / Navire / Inventaire / Équipage).
 *  Le bouton de la vue courante est disabled. Le bouton Taverne n'apparaît que si une taverne est accessible. */
export function buildMenuButtons(currentKey: string, ownerDiscordId: string, player: Player): ActionRowBuilder<ButtonBuilder> {
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    buildProfilButton(ownerDiscordId, player.id, { disabled: currentKey === PROFIL_BUTTON_NAME }),
    buildShipButton(ownerDiscordId, player.id, { disabled: currentKey === SHIP_BUTTON_NAME }),
    buildCrewNavButton(ownerDiscordId, player.id, { disabled: currentKey === CREW_BUTTON_NAME }),
    buildInventoryNavButton(ownerDiscordId, player.id, { disabled: currentKey === INVENTORY_BUTTON_NAME }),
  );
  if (getReachableTavern(player) !== undefined) row.addComponents(buildTavernButton(ownerDiscordId, player.id));
  return row;
}
