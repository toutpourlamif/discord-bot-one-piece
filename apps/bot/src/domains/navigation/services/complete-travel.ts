import { type Island, type Sea, type Transaction } from '@one-piece/db';

import * as historyRepository from '../../history/index.js';
import * as playerRepository from '../../player/repository.js';

import { recordZoneChange } from './record-zone-change.js';

type CompleteTravelParams = {
  playerId: number;
  fromSea: Sea;
  startedBucket: number;
  arrivedZone: Island;
  drifted: boolean;
  intendedTo: Island;
  bucketId: number;
  tx: Transaction;
};

/** Applique l'outcome d'un voyage déjà décidé en amont (cf `decideTravelOutcome`). */
export async function completeTravel(params: CompleteTravelParams): Promise<void> {
  const { playerId, fromSea, startedBucket, arrivedZone, drifted, intendedTo, bucketId, tx } = params;
  const actualDurationBuckets = bucketId - startedBucket;

  await recordZoneChange({ playerId, newZone: arrivedZone, bucketId, tx });
  await playerRepository.clearTravel(playerId, { client: tx });

  if (drifted) {
    await historyRepository.appendHistory({
      type: 'travel.drifted',
      actorPlayerId: playerId,
      bucketId,
      payload: { from: fromSea, intendedTo, actualTo: arrivedZone, actualDurationBuckets },
      client: tx,
    });
  } else {
    await historyRepository.appendHistory({
      type: 'travel.arrived',
      actorPlayerId: playerId,
      bucketId,
      payload: { from: fromSea, to: arrivedZone, actualDurationBuckets },
      client: tx,
    });
  }
}
