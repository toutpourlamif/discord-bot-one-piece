import type { Player } from '@one-piece/db';

export function getCrewDisplayName(player: Player): string {
  return player.crewName ?? `Équipage de ${player.name}`;
}
