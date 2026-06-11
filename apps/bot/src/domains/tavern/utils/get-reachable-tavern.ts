import { TAVERN_CONFIG_BY_ZONE, type Player, type TavernConfig } from '@one-piece/db';

import { isSea } from '../../navigation/utils/index.js';

/** La taverne accessible depuis la position actuelle du joueur, si pas de taverne, return `undefined` */
export function getReachableTavern(player: Player): TavernConfig | undefined {
  if (player.travelTargetZone !== null || isSea(player.currentZone)) return undefined;
  return TAVERN_CONFIG_BY_ZONE[player.currentZone];
}
