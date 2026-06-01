import type { Edge, ResourceName, Sea, SubZone } from '@one-piece/db';

import type { TravelOutcome } from '../../navigation/types.js';

export type EventEffect =
  | { type: 'addBerries'; amount: bigint }
  | { type: 'spendBerries'; amount: bigint }
  | { type: 'startTravel'; edge: Edge; etaBucket: number }
  | ({ type: 'completeTravel'; fromSea: Sea; startedBucket: number } & TravelOutcome)
  | { type: 'updateTravelTarget'; newEdge: Edge; newEtaBucket: number }
  | { type: 'changeSubZone'; targetSubZone: SubZone }
  | { type: 'addResource'; name: ResourceName; quantity: number }
  | { type: 'addCharacter'; templateName: string };
