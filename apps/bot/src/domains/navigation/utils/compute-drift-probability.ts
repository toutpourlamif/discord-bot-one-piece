import type { Island, Sea, Ship } from '@one-piece/db';
import clamp from 'lodash/clamp.js';

import type { Inventory } from '../../resource/types.js';
import type { Edge, TravelModifier } from '../world.js';

import { hasLogOrEternalPoseForIsland, findEdge } from './index.js';

const DRIFT_BASE_PROBABILITY = 0.02;
const DRIFT_MAX_PROBABILITY = 0.5;
const DRIFT_SHIP_DAMAGE_WEIGHT = 0.3;
const DRIFT_NO_POSE_PENALTY = 0.2;
const MAX_SHIP_HP = 100;

type ComputeDriftProbabilityParams = {
  ship: Ship;
  inventory: Inventory;
  fromSea: Sea;
  intendedZone: Island;
};

/**
 * Retourne la probabilité que le joueur dérive et n'atteigne pas l'île visée.
 * Combine : base + dégâts du navire + absence de Log/Eternal Pose + modificateurs propres à l'arête du graph.
 */
export function computeDriftProbability({ ship, inventory, fromSea, intendedZone }: ComputeDriftProbabilityParams): number {
  const hasPose = hasLogOrEternalPoseForIsland(inventory, intendedZone);
  // TODO: brancher hasNavigator quand le système de skills character existera
  const modifierDriftDelta = sumModifierDriftDelta(findEdge(fromSea, intendedZone), { hasNavigator: false });

  const damagePenalty = (1 - ship.hp / MAX_SHIP_HP) * DRIFT_SHIP_DAMAGE_WEIGHT;
  const posePenalty = hasPose ? 0 : DRIFT_NO_POSE_PENALTY;

  return clamp(DRIFT_BASE_PROBABILITY + damagePenalty + posePenalty + modifierDriftDelta, DRIFT_BASE_PROBABILITY, DRIFT_MAX_PROBABILITY);
}

type TravelModifierConditions = {
  hasNavigator: boolean;
};

/** Somme des `driftDelta` des modifiers de l'arête qui s'appliquent (selon `conditions`). */
function sumModifierDriftDelta(edge: Edge | undefined, conditions: TravelModifierConditions): number {
  if (!edge?.modifiers) return 0;
  return edge.modifiers
    .filter((modifier) => isModifierApplicable(modifier, conditions))
    .reduce((acc, modifier) => acc + (modifier.driftDelta ?? 0), 0);
}

/** True si le modifier doit être pris en compte au regard de l'état actuel du joueur. */
function isModifierApplicable(modifier: TravelModifier, conditions: TravelModifierConditions): boolean {
  switch (modifier.kind) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- On a que no navigator pr l'instant // TODO: ENLEVER quand on en a plsr
    case 'no_navigator':
      return !conditions.hasNavigator;
  }
}
