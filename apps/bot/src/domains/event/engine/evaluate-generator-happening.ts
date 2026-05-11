import type { EventGenerator, GeneratorContext, Rng } from '../types.js';

import { createRngForGenerator } from './rng.js';

/**
 * Évalue les filtres (conditions, cooldown, oneTime) puis tire la probabilité.
 * @returns le rng (déjà avancé d'un tick par le test de proba) si le générateur passe, sinon return null
 */
export function evaluateGeneratorHappening(gen: EventGenerator, ctx: GeneratorContext): Rng | null {
  if (gen.conditions && !gen.conditions(ctx)) return null;
  if (gen.cooldownBuckets !== undefined && ctx.history.countSinceNBuckets(gen.key, gen.cooldownBuckets) > 0) return null;
  if (gen.oneTime === true && ctx.history.has(gen.key)) return null;

  const rng = createRngForGenerator(gen, ctx);
  if (rng.next() >= gen.probability(ctx)) return null;
  return rng;
}
