import type { Transaction } from '@one-piece/db';

import { decideTravelOutcome, isSea } from '../../navigation/utils/index.js';
import { applyEffects } from '../effects/apply-effects.js';
import { arrivalByIsland } from '../generators/passive/arrivals/registry.js';
import { driftSurprise } from '../generators/passive/drift-surprise.js';
import type { GeneratorContext } from '../types.js';

import type { GeneratorContextData } from './context-builders.js';
import { recordPassive } from './record-event.js';
import { createRng, seedFromBucketAndZone } from './rng.js';

type TryCompleteTravelParams = {
  ctx: GeneratorContext;
  ctxData: GeneratorContextData;
  tx: Transaction;
};

/**
 * Regarde si l'ETA est atteinte, si oui : décide si on drift (créer driftNavigation event), puis créer l'event d'arrivée de l'île.
 * Mute `ctx` (via applyEffects/recordPassive) pour que la boucle de générateurs qui suit voie la nouvelle zone.
 */
export async function tryCompleteTravel({ ctx, ctxData, tx }: TryCompleteTravelParams): Promise<void> {
  const { travelTargetZone, travelEtaBucket, travelStartedBucket, currentZone } = ctx.player;
  if (!travelTargetZone || !travelEtaBucket || !travelStartedBucket) return;
  if (ctx.bucketId < travelEtaBucket) return;
  if (!isSea(currentZone)) return;

  const rng = createRng(seedFromBucketAndZone(ctx.bucketId, currentZone));
  const outcome = decideTravelOutcome({
    fromSea: currentZone,
    intendedTo: travelTargetZone,
    ship: ctxData.ship,
    inventory: ctxData.inventory,
    rng,
  });

  await applyEffects([{ type: 'completeTravel', fromSea: currentZone, startedBucket: travelStartedBucket, ...outcome }], ctx, tx);

  if (outcome.drifted) {
    await recordPassive(driftSurprise, ctx, ctxData, rng, tx);
  }

  await recordPassive(arrivalByIsland[outcome.arrivedZone], ctx, ctxData, rng, tx);
}
