import type { ResourceName } from '../../resource/index.js';

import { inBuckets } from './in-buckets.js';
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
  requirements?: Array<TravelRequirement>;
  modifiers?: Array<TravelModifier>;
};

const EAST_BLUE_BUCKETS = inBuckets('2h');

export const WORLD_EDGES: Array<Edge> = [
  { from: 'satsuruzo_kingdom', to: 'yotsuba_island', via: 'sea_east_blue', baseDurationBuckets: EAST_BLUE_BUCKETS },
  { from: 'dawn_island', to: 'goat_island', via: 'sea_east_blue', baseDurationBuckets: inBuckets('1h') },
  { from: 'dawn_island', to: 'yotsuba_island', via: 'sea_east_blue', baseDurationBuckets: EAST_BLUE_BUCKETS },
  { from: 'goat_island', to: 'yotsuba_island', via: 'sea_east_blue', baseDurationBuckets: EAST_BLUE_BUCKETS },
  { from: 'yotsuba_island', to: 'loguetown', via: 'sea_east_blue', baseDurationBuckets: inBuckets('3h') },
  { from: 'loguetown', to: 'reverse_mountain', via: 'sea_east_blue', baseDurationBuckets: 8 },
  {
    from: 'reverse_mountain',
    to: 'whisky_peak',
    via: 'sea_paradise',
    baseDurationBuckets: inBuckets('6h'),
    requirements: [{ kind: 'item', name: 'Log Pose' }],
  },
  {
    from: 'whisky_peak',
    to: 'little_garden',
    via: 'sea_paradise',
    baseDurationBuckets: inBuckets('6h'),
    requirements: [{ kind: 'item', name: 'Log Pose' }],
  },
  {
    from: 'little_garden',
    to: 'drum',
    via: 'sea_paradise',
    baseDurationBuckets: inBuckets('8h'),
    requirements: [{ kind: 'item', name: 'Log Pose' }],
  },
  {
    from: 'drum',
    to: 'alabasta',
    via: 'sea_paradise',
    baseDurationBuckets: inBuckets('5h'),
    requirements: [{ kind: 'item', name: 'Log Pose' }],
  },
  // TODO: remove, fake data
  {
    from: 'alabasta',
    to: 'wano',
    via: 'sea_paradise',
    baseDurationBuckets: 1,
  },
];
