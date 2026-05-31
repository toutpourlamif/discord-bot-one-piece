import { WORLD_EDGES, type Edge, type Island } from '@one-piece/db';

export function findPossibleEdges(currentIsland: Island): Array<Edge> {
  return WORLD_EDGES.flatMap((edge) => {
    if (edge.from === currentIsland) {
      return [edge];
    }
    if (edge.to === currentIsland && !edge.oneWay) {
      return [reverseEdge(edge)];
    }
    return [];
  });
}

function reverseEdge(edge: Edge): Edge {
  return { ...edge, from: edge.to, to: edge.from };
}
