import type { Island } from '@one-piece/db';

export type TravelOutcome = {
  arrivedZone: Island;
  drifted: boolean;
  intendedTo: Island;
};
