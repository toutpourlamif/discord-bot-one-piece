import type { ResourceName, Island, Sea } from '@one-piece/db';

type TravelRequirement = { kind: 'item'; name: ResourceName };

type TravelModifier = { kind: 'no_navigator'; multiplier: number };

type Edge = {
  from: Island;
  to: Island;
  via: Sea;
  baseDurationBuckets: number;
  requirements?: Array<TravelRequirement>;
  modifiers?: Array<TravelModifier>;
};

export const ZONE_GRAPH = [
  { from: 'foosha', to: 'loguetown', via: 'sea_east_blue', baseDurationBuckets: 6 },
  { from: 'loguetown', to: 'reverse_mountain', via: 'sea_east_blue', baseDurationBuckets: 8 },
  {
    from: 'reverse_mountain',
    to: 'whisky_peak',
    via: 'sea_paradise',
    baseDurationBuckets: 12,
    requirements: [{ kind: 'item', name: 'Log Pose' }],
  },
  {
    from: 'whisky_peak',
    to: 'little_garden',
    via: 'sea_paradise',
    baseDurationBuckets: 18,
    requirements: [{ kind: 'item', name: 'Log Pose' }],
  },
  {
    from: 'little_garden',
    to: 'drum',
    via: 'sea_paradise',
    baseDurationBuckets: 25,
    requirements: [{ kind: 'item', name: 'Log Pose' }],
  },
  {
    from: 'drum',
    to: 'alabasta',
    via: 'sea_paradise',
    baseDurationBuckets: 30,
    requirements: [{ kind: 'item', name: 'Log Pose' }],
  },
] satisfies Array<Edge>;
