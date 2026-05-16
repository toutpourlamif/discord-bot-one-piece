import type { Edge, Ship } from '@one-piece/db';

import type { CharacterRow } from '../../character/types.js';

const SAIL_SPEEDUP_PER_LEVEL = 0.05;

// TODO: les skills navigateur seront définis dans la PR skills
type NavigatorSkill = 'NAVIGATOR' | 'MEGA_NAVIGATOR';
const NAVIGATOR_MULTIPLIER: Record<NavigatorSkill, number> = {
  NAVIGATOR: 0.85,
  MEGA_NAVIGATOR: 0.7,
};

type ComputeTravelETAInput = {
  edge: Edge;
  ship: Ship;
  crew: Array<CharacterRow>;
  startedBucket: number;
};

/** Calcule le `bucket_id` d'arrivée d'un voyage : `started + ceil(base × shipMultiplier × navigatorMultiplier)`. */
export function computeTravelETA({ edge, ship, crew, startedBucket }: ComputeTravelETAInput): number {
  const shipMultiplier = sailLevelToMultiplier(ship.sailLevel);
  const navigatorSkill = findBestNavigatorSkill(crew);
  const navigatorMultiplier = !navigatorSkill ? 1 : NAVIGATOR_MULTIPLIER[navigatorSkill];

  const durationBuckets = Math.ceil(edge.baseDurationBuckets * shipMultiplier * navigatorMultiplier);

  return startedBucket + durationBuckets;
}

function sailLevelToMultiplier(sailLevel: number): number {
  return 1 - (sailLevel - 1) * SAIL_SPEEDUP_PER_LEVEL;
}

function findBestNavigatorSkill(_crew: Array<CharacterRow>): NavigatorSkill | null {
  return null;
}
