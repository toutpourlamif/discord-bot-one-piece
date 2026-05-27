import type { Edge } from '../edges.js';
import { inBuckets } from '../in-buckets.js';

export const PARADISE_EDGES: Array<Edge> = [
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
