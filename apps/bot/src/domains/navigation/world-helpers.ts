import type { GeneratorContext } from '../event/types.js';

export function bucketsUntilEta(ctx: GeneratorContext): number {
  if (ctx.player.travelEtaBucket === null) return Number.POSITIVE_INFINITY;
  return ctx.player.travelEtaBucket - ctx.bucketId;
}
