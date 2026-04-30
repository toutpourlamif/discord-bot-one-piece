import type { Ship } from '@one-piece/db';

/** On commence à 2, chaque niveau rajoute 1 slot (et vu qu'on commence au niveau 1, début = 3) */
const CREW_CAPACITY_BASE = 2;

export function getCrewCapacity(ship: Ship): number {
  return CREW_CAPACITY_BASE + ship.decksLevel;
}
