import type { Island, Sea } from '@one-piece/db';

import { ZONE_GRAPH, type Edge } from '../world.js';

export function findEdge(via: Sea, to: Island): Edge | undefined {
  return ZONE_GRAPH.find((edge) => edge.via === via && edge.to === to);
}
