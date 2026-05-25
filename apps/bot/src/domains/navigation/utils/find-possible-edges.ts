import { WORLD_EDGES, type Edge, type Island } from '@one-piece/db';

export function findPossibleEdges(from: Island): Array<Edge> {
  // TODO: traiter les routes comme bidirectionnelles : `from -> to` et `to -> from` doivent représenter le même trajet.
  return WORLD_EDGES.filter((edge) => edge.from === from);
}
