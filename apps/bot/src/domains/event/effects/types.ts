import type { Edge, Island } from '@one-piece/db';

export type EventEffect =
  | { type: 'addBerries'; amount: bigint }
  | { type: 'spendBerries'; amount: bigint }
  | { type: 'startTravel'; edge: Edge; etaBucket: number }
  | { type: 'completeTravel'; arrivedZone: Island; drifted?: boolean; intendedTo?: Island }
  | { type: 'updateTravelTarget'; newEdge: Edge; newEtaBucket: number };
