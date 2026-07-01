import type { Player } from '@one-piece/db';

// TODO: i18n — fallback selon guild.language (`${player.name}'s crew` en anglais) quand le chantier i18n des renderers sera lancé (cf. TODO guild/service.ts). Hardcodé en français pour l'instant.
export function getCrewDisplayName(player: Player): string {
  return player.crewName ?? `Équipage de ${player.name}`;
}
