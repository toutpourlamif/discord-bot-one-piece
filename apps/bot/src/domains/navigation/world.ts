import { ISLANDS, SEAS, ZONES, type Island, type Sea, type Zone } from '@one-piece/db';

export { ISLANDS, SEAS, ZONES, type Island, type Sea, type Zone };

type TravelCondition = { kind: 'item'; name: string };

type TravelModifier = { kind: 'no_navigator'; multiplier: number };

type Edge = {
  from: Island;
  to: Island;
  via: Sea;
  baseDurationBuckets: number;
  requires?: Array<TravelCondition>;
  softModifiers?: Array<TravelModifier>;
};

export const ZONE_GRAPH = [
  { from: 'foosha', to: 'loguetown', via: 'sea_east_blue', baseDurationBuckets: 6 },
  { from: 'loguetown', to: 'reverse_mountain', via: 'sea_east_blue', baseDurationBuckets: 8 },
  {
    from: 'reverse_mountain',
    to: 'whisky_peak',
    via: 'sea_paradise',
    baseDurationBuckets: 12,
    requires: [{ kind: 'item', name: 'Log Pose' }],
  },
  {
    from: 'whisky_peak',
    to: 'little_garden',
    via: 'sea_paradise',
    baseDurationBuckets: 18,
    requires: [{ kind: 'item', name: 'Log Pose' }],
  },
  {
    from: 'little_garden',
    to: 'drum',
    via: 'sea_paradise',
    baseDurationBuckets: 25,
    requires: [{ kind: 'item', name: 'Log Pose' }],
  },
  {
    from: 'drum',
    to: 'alabasta',
    via: 'sea_paradise',
    baseDurationBuckets: 30,
    requires: [{ kind: 'item', name: 'Log Pose' }],
  },
] satisfies Array<Edge>;
