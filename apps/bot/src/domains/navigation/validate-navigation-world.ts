import { WORLD_EDGES, type Edge } from '@one-piece/db';

export function validateNavigationWorld(): void {
  const seenEdges = new Set<string>();

  for (const edge of WORLD_EDGES) {
    validateNoDuplicateOrReverseEdge(edge, seenEdges);
  }
}

function validateNoDuplicateOrReverseEdge(edge: Edge, seenEdges: Set<string>): void {
  if (edge.from === edge.to) {
    throw new Error(`[navigation/world.ts] Self-loop interdit : ${edge.from}→${edge.to}`);
  }
  const edgeKey = `${edge.from}→${edge.to}`;
  const reverseEdgeKey = `${edge.to}→${edge.from}`;
  if (seenEdges.has(edgeKey)) {
    throw new Error(`[navigation/world.ts] Edge dupliqué : ${edgeKey} apparaît plusieurs fois`);
  }
  if (seenEdges.has(reverseEdgeKey)) {
    throw new Error(`[navigation/world.ts] Cycle direct détecté : ${edgeKey} et ${reverseEdgeKey} coexistent`);
  }
  seenEdges.add(edgeKey);
}
