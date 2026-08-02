export const FISHING_MAX_ATTEMPTS_PER_HOUR = 10;

export const FISHING_OUTCOME_WEIGHTS = [
  { type: 'nothing', weight: 45 },
  { type: 'resource', weight: 40 },
  { type: 'berry', weight: 15 },
] as const;

export const FISHING_BERRY_MIN = 20;
export const FISHING_BERRY_MAX = 60;
