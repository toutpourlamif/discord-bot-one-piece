import type { ResourceName } from '@one-piece/db';

import { getRandomIntBetween } from '../../event/engine/rng.js';
import type { Rng } from '../../event/types.js';
import { FISHING_BERRY_MAX, FISHING_BERRY_MIN, FISHING_OUTCOME_WEIGHTS } from '../constants.js';
import type { FishingResult } from '../types.js';

import { pickFishingLootResource } from './pick-fishing-loot-resource.js';
import { pickWeighted } from './pick-weighted.js';

export function rollFishingOutcome(rng: Rng, eligibleResourceNames: ReadonlyArray<ResourceName>): FishingResult {
  const outcomeType = pickWeighted(rng, FISHING_OUTCOME_WEIGHTS);
  switch (outcomeType) {
    case 'nothing':
      return { outcome: 'nothing' };
    case 'resource':
      return { outcome: 'resource', resourceName: pickFishingLootResource(rng, eligibleResourceNames), quantity: 1 };
    case 'berry':
      return { outcome: 'berry', amount: getRandomIntBetween(rng, FISHING_BERRY_MIN, FISHING_BERRY_MAX) };
  }
}
