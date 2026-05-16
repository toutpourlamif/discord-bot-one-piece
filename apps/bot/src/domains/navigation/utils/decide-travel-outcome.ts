import type { Player, Ship } from '@one-piece/db';

import { ValidationError } from '../../../discord/errors.js';
import type { Rng } from '../../event/types.js';
import type { Inventory } from '../../resource/types.js';
import type { TravelOutcome } from '../types.js';

import { computeDriftProbability } from './compute-drift-probability.js';
import { isSea } from './is-sea.js';
import { pickDriftIsland } from './pick-drift-island.js';

type DecideTravelOutcomeInput = {
  player: Player;
  ship: Ship;
  inventory: Inventory;
  rng: Rng;
};

/** Décide si le joueur arrive à destination ou dérive. À appeler par les générateurs avant d'émettre un effet `completeTravel`. */
export function decideTravelOutcome({ player, ship, inventory, rng }: DecideTravelOutcomeInput): TravelOutcome {
  if (player.travelTargetZone === null) {
    throw new ValidationError("Le joueur n'a pas de voyage en cours.");
  }
  if (!isSea(player.currentZone)) {
    throw new ValidationError('Le joueur doit être en mer pour terminer un voyage.');
  }

  const intendedTo = player.travelTargetZone;
  const fromSea = player.currentZone;
  const driftProbability = computeDriftProbability({ ship, inventory, fromSea, intendedZone: intendedTo });
  const drifted = rng.next() < driftProbability;
  const arrivedZone = drifted ? pickDriftIsland(fromSea, intendedTo, rng) : intendedTo;

  return { arrivedZone, drifted, intendedTo };
}
