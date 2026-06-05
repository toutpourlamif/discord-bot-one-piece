import type { Edge } from '../types.js';
import { inBuckets } from '../utils/in-buckets.js';

const EAST_BLUE_BASE_TRAVEL_DURATION = inBuckets('2h');

function computeEastBlueTravelDurationBuckets(multiplier: number): number {
  return Math.round(EAST_BLUE_BASE_TRAVEL_DURATION * multiplier);
}

export const EAST_BLUE_EDGES: Array<Edge> = [
  {
    from: 'satsuruzo',
    to: 'yotsuba',
    via: 'sea_east_blue',
    baseDurationBuckets: computeEastBlueTravelDurationBuckets(0.5),
  },
  {
    from: 'satsuruzo',
    to: 'nagagutsu',
    via: 'sea_east_blue',
    baseDurationBuckets: computeEastBlueTravelDurationBuckets(2),
  },
  {
    from: 'dawn',
    to: 'satsuruzo',
    via: 'sea_east_blue',
    baseDurationBuckets: computeEastBlueTravelDurationBuckets(1.5),
  },
  { from: 'dawn', to: 'goat', via: 'sea_east_blue', baseDurationBuckets: computeEastBlueTravelDurationBuckets(1) },
  { from: 'dawn', to: 'yotsuba', via: 'sea_east_blue', baseDurationBuckets: computeEastBlueTravelDurationBuckets(1) },
  { from: 'goat', to: 'sixis', via: 'sea_east_blue', baseDurationBuckets: computeEastBlueTravelDurationBuckets(1.5) },
  { from: 'goat', to: 'nagagutsu', via: 'sea_east_blue', baseDurationBuckets: computeEastBlueTravelDurationBuckets(2) },
  { from: 'goat', to: 'organ', via: 'sea_east_blue', baseDurationBuckets: computeEastBlueTravelDurationBuckets(1.5) },
  { from: 'goat', to: 'kumate', via: 'sea_east_blue', baseDurationBuckets: computeEastBlueTravelDurationBuckets(0.5) },
  { from: 'goat', to: 'yotsuba', via: 'sea_east_blue', baseDurationBuckets: computeEastBlueTravelDurationBuckets(1) },
  { from: 'yotsuba', to: 'organ', via: 'sea_east_blue', baseDurationBuckets: computeEastBlueTravelDurationBuckets(1.5) },
  { from: 'yotsuba', to: 'nagagutsu', via: 'sea_east_blue', baseDurationBuckets: computeEastBlueTravelDurationBuckets(2) },
  { from: 'yotsuba', to: 'kumate', via: 'sea_east_blue', baseDurationBuckets: computeEastBlueTravelDurationBuckets(1.5) },
  { from: 'yotsuba', to: 'mirrorball', via: 'sea_east_blue', baseDurationBuckets: computeEastBlueTravelDurationBuckets(2) },
  { from: 'mirrorball', to: 'nagagutsu', via: 'sea_east_blue', baseDurationBuckets: computeEastBlueTravelDurationBuckets(0.5) },
  { from: 'mirrorball', to: 'organ', via: 'sea_east_blue', baseDurationBuckets: computeEastBlueTravelDurationBuckets(0.5) },
  { from: 'mirrorball', to: 'gecko', via: 'sea_east_blue', baseDurationBuckets: computeEastBlueTravelDurationBuckets(1) },
  { from: 'nagagutsu', to: 'organ', via: 'sea_east_blue', baseDurationBuckets: computeEastBlueTravelDurationBuckets(1) },
  { from: 'nagagutsu', to: 'gecko', via: 'sea_east_blue', baseDurationBuckets: computeEastBlueTravelDurationBuckets(2) },
  { from: 'organ', to: 'gecko', via: 'sea_east_blue', baseDurationBuckets: computeEastBlueTravelDurationBuckets(1.5) },
  { from: 'organ', to: 'kumate', via: 'sea_east_blue', baseDurationBuckets: computeEastBlueTravelDurationBuckets(1) },
  { from: 'organ', to: 'rare_animal', via: 'sea_east_blue', baseDurationBuckets: computeEastBlueTravelDurationBuckets(0.5) },
  { from: 'rare_animal', to: 'gecko', via: 'sea_east_blue', baseDurationBuckets: computeEastBlueTravelDurationBuckets(1) },
  { from: 'rare_animal', to: 'kumate', via: 'sea_east_blue', baseDurationBuckets: computeEastBlueTravelDurationBuckets(0.5) },
  { from: 'rare_animal', to: 'tequila_wolf', via: 'sea_east_blue', baseDurationBuckets: computeEastBlueTravelDurationBuckets(5) },
  { from: 'kumate', to: 'sixis', via: 'sea_east_blue', baseDurationBuckets: computeEastBlueTravelDurationBuckets(1.5) },
  { from: 'kumate', to: 'tequila_wolf', via: 'sea_east_blue', baseDurationBuckets: computeEastBlueTravelDurationBuckets(5) },
  { from: 'sixis', to: 'tequila_wolf', via: 'sea_east_blue', baseDurationBuckets: computeEastBlueTravelDurationBuckets(5) },
  { from: 'gecko', to: 'baratie', via: 'sea_east_blue', baseDurationBuckets: computeEastBlueTravelDurationBuckets(1) },
  { from: 'baratie', to: 'conomi', via: 'sea_east_blue', baseDurationBuckets: computeEastBlueTravelDurationBuckets(2) },
  { from: 'baratie', to: 'oykot', via: 'sea_east_blue', baseDurationBuckets: computeEastBlueTravelDurationBuckets(1.5) },
  { from: 'baratie', to: 'pole_star', via: 'sea_east_blue', baseDurationBuckets: computeEastBlueTravelDurationBuckets(3) },
  { from: 'conomi', to: 'cozia', via: 'sea_east_blue', baseDurationBuckets: computeEastBlueTravelDurationBuckets(1) },
  { from: 'conomi', to: 'frauce', via: 'sea_east_blue', baseDurationBuckets: computeEastBlueTravelDurationBuckets(1) },
  { from: 'conomi', to: 'oykot', via: 'sea_east_blue', baseDurationBuckets: computeEastBlueTravelDurationBuckets(1.5) },
  { from: 'conomi', to: 'pole_star', via: 'sea_east_blue', baseDurationBuckets: computeEastBlueTravelDurationBuckets(3) },
  { from: 'cozia', to: 'frauce', via: 'sea_east_blue', baseDurationBuckets: computeEastBlueTravelDurationBuckets(0.5) },
  { from: 'oykot', to: 'pole_star', via: 'sea_east_blue', baseDurationBuckets: computeEastBlueTravelDurationBuckets(1.5) },
  { from: 'pole_star', to: 'reverse_mountain', via: 'sea_east_blue', baseDurationBuckets: computeEastBlueTravelDurationBuckets(3) },
];
