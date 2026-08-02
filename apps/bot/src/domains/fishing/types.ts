import type { ResourceName } from '@one-piece/db';

export type FishingResult =
  | { outcome: 'nothing' }
  | { outcome: 'resource'; resourceName: ResourceName; quantity: number }
  | { outcome: 'berry'; amount: number };
