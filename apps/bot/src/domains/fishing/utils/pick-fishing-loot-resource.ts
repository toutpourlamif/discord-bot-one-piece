import type { ResourceName } from '@one-piece/db';

import { pickRandom } from '../../event/engine/rng.js';
import type { Rng } from '../../event/types.js';

export function pickFishingLootResource(rng: Rng, eligibleResourceNames: ReadonlyArray<ResourceName>): ResourceName {
  return pickRandom(rng, eligibleResourceNames);
}
