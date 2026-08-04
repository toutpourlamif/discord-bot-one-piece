import { db, type DbOrTransaction } from '@one-piece/db';

import type { FishingResult } from '../types.js';
import { buildUnseededRng, pickFishingLootResource } from '../utils/index.js';

import { applyFishingOutcome } from './apply-fishing-outcome.js';
import { getEligibleFishingResourceNames } from './get-eligible-fishing-resource-names.js';

// TODO: stub pour la première prise scriptée de l'onboarding — garantit juste une resource, pas de vraie logique dédiée pour l'instant.
export async function runFirstFishingCatch(
  playerId: number,
  client: DbOrTransaction = db,
): Promise<Extract<FishingResult, { outcome: 'resource' }>> {
  const eligibleResourceNames = await getEligibleFishingResourceNames(client);
  const outcome: Extract<FishingResult, { outcome: 'resource' }> = {
    outcome: 'resource',
    resourceName: pickFishingLootResource(buildUnseededRng(), eligibleResourceNames),
    quantity: 1,
  };
  await applyFishingOutcome(playerId, outcome, client);

  return outcome;
}
