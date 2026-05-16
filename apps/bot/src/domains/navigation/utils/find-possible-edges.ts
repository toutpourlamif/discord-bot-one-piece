import { WORLD_EDGES, type Edge, type Island } from '@one-piece/db';

export function findPossibleEdges(from: Island): Array<Edge> {
  return WORLD_EDGES.filter((edge) => edge.from === from);
}
