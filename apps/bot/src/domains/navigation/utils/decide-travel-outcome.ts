import type { Island, Sea, Ship } from '@one-piece/db';

import type { Rng } from '../../event/types.js';
import type { Inventory } from '../../resource/types.js';
import type { TravelOutcome } from '../types.js';

import { computeDriftProbability } from './compute-drift-probability.js';
import { pickDriftIsland } from './pick-drift-island.js';

type DecideTravelOutcomeParams = {
  fromSea: Sea;
  intendedTo: Island;
  ship: Ship;
  inventory: Inventory;
  rng: Rng;
};

/** Décide si le joueur arrive à destination ou dérive. Appelée par `tryCompleteTravel` qui a déjà validé l'état. */
export function decideTravelOutcome(params: DecideTravelOutcomeParams): TravelOutcome {
  const { fromSea, intendedTo, ship, inventory, rng } = params;
  const driftProbability = computeDriftProbability({ ship, inventory, fromSea, intendedZone: intendedTo });
  const drifted = rng.next() < driftProbability;
  const arrivedZone = drifted ? pickDriftIsland(fromSea, intendedTo, rng) : intendedTo;

  return { arrivedZone, drifted, intendedTo };
}
