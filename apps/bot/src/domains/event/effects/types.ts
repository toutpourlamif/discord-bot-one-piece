import type { Edge } from '@one-piece/db';

import type { TravelOutcome } from '../../navigation/types.js';

export type EventEffect =
  | { type: 'addBerries'; amount: bigint }
  | { type: 'spendBerries'; amount: bigint }
  | { type: 'startTravel'; edge: Edge; etaBucket: number }
  | ({ type: 'completeTravel' } & TravelOutcome)
  | { type: 'updateTravelTarget'; newEdge: Edge; newEtaBucket: number };
