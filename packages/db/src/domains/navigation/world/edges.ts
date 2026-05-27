import type { ResourceName } from '../../resource/index.js';

import { EAST_BLUE_EDGES } from './east-blue/edges.js';
import { PARADISE_EDGES } from './paradise/edges.js';
import type { Island, Sea } from './zones.js';

type TravelRequirement = { kind: 'item'; name: ResourceName };

export type TravelModifierKind = 'no_navigator';

export type TravelModifier = {
  kind: TravelModifierKind;
  /** Multiplicateur (%) de durée du voyage. */
  durationMultiplier?: number;
  /** Ajout à la probabilité de dérive */
  driftDelta?: number;
};

export type Edge = {
  from: Island;
  to: Island;
  via: Sea;
  baseDurationBuckets: number;
  oneWay?: boolean;
  requirements?: Array<TravelRequirement>;
  modifiers?: Array<TravelModifier>;
};

export const WORLD_EDGES: Array<Edge> = [...EAST_BLUE_EDGES, ...PARADISE_EDGES];
