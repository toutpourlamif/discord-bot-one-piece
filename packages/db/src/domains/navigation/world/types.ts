import type { ResourceName } from '../../resource/index.js';

import type { Island } from './registry.js';
import type { Sea } from './seas.js';
// TODO: Déplacer les types dans le dossier types
export type Edge = {
  from: Island;
  to: Island;
  via: Sea;
  baseDurationBuckets: number;
  oneWay?: boolean;
  requirements?: Array<TravelRequirement>;
  modifiers?: Array<TravelModifier>;
};

export type TravelRequirement = { kind: 'item'; name: ResourceName };

export type TravelModifierKind = 'no_navigator';

export type TravelModifier = {
  kind: TravelModifierKind;
  /** Multiplicateur (%) de durée du voyage. */
  durationMultiplier?: number;
  /** Ajout à la probabilité de dérive */
  driftDelta?: number;
};
