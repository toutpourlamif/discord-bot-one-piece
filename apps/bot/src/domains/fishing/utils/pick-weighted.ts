import sumBy from 'lodash/sumBy.js';

import type { Rng } from '../../event/types.js';

export function pickWeighted<T extends string>(rng: Rng, entries: ReadonlyArray<{ type: T; weight: number }>): T {
  const totalWeight = sumBy(entries, 'weight');
  const roll = rng.next() * totalWeight;

  let cumulativeWeight = 0;
  for (const entry of entries) {
    cumulativeWeight += entry.weight;
    if (roll < cumulativeWeight) return entry.type;
  }
  return entries[entries.length - 1]!.type;
}
