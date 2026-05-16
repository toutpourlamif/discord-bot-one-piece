import { WORLD_EDGES, type Island, type Sea } from '@one-piece/db';

import { pickRandom } from '../../event/engine/rng.js';
import type { Rng } from '../../event/types.js';

/**
 * Choisit aléatoirement une île d'arrivée alternative quand le joueur dérive :
 * une autre île accessible via la même mer `fromSea`. Fallback à `intendedZone` si aucune autre option.
 */
export function pickDriftIsland(fromSea: Sea, intendedZone: Island, rng: Rng): Island {
  const candidates = WORLD_EDGES.filter((edge) => edge.via === fromSea && edge.to !== intendedZone).map((edge) => edge.to);
  if (candidates.length === 0) return intendedZone;

  return pickRandom(rng, candidates);
}
