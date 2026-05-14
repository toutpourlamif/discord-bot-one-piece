import { ISLANDS, SEAS, WORLD_EDGES, type Edge } from '@one-piece/db';

export function validateNavigationWorld(): void {
  const seenEdges = new Set<string>();

  for (const edge of WORLD_EDGES) {
    validateFromToAndViaZonesExist(edge);
    validateNoDuplicateOrReverseEdge(edge, seenEdges);
  }
}

function validateFromToAndViaZonesExist(edge: Edge): void {
  const txt = `${edge.from} → ${edge.to} via ${edge.via}`;
  if (!ISLANDS.includes(edge.from)) {
    throw new Error(`[navigation/world.ts] Edge invalide (${txt}) : from '${edge.from}' n'est pas une Island connue`);
  }
  if (!ISLANDS.includes(edge.to)) {
    throw new Error(`[navigation/world.ts] Edge invalide (${txt}) : to '${edge.to}' n'est pas une Island connue`);
  }
  if (!SEAS.includes(edge.via)) {
    throw new Error(`[navigation/world.ts] Edge invalide (${txt}) : via '${edge.via}' n'est pas une Sea connue`);
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
