import type { Island, Player } from '@one-piece/db';

/** Voyage en cours : les colonnes de voyage sont écrites/effacées ensemble, on narrow celles qu'on vérifie. */
export function isInTravel(player: Player): player is Player & { travelTargetZone: Island; travelEtaBucket: number } {
  return player.travelTargetZone !== null && player.travelEtaBucket !== null;
}
