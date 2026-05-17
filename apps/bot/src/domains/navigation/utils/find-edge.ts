import { WORLD_EDGES, type Edge, type Island, type Sea } from '@one-piece/db';

export function findEdge(via: Sea, to: Island): Edge | undefined {
  return WORLD_EDGES.find((edge) => edge.via === via && edge.to === to);
}
