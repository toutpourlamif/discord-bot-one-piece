import { type Island, type Transaction } from '@one-piece/db';

import { ValidationError } from '../../../discord/errors.js';
import * as historyRepository from '../../history/index.js';
import * as playerRepository from '../../player/repository.js';
import { isSea } from '../utils/index.js';

import { recordZoneChange } from './record-zone-change.js';

type CompleteTravelParams = {
  playerId: number;
  arrivedZone: Island;
  drifted: boolean;
  intendedTo: Island;
  bucketId: number;
  tx: Transaction;
};

/** Applique l'outcome d'un voyage déjà décidé en amont (cf `decideTravelOutcome`). */
export async function completeTravel({ playerId, arrivedZone, drifted, intendedTo, bucketId, tx }: CompleteTravelParams): Promise<void> {
  const playerRow = await playerRepository.findByIdOrThrow(playerId, tx, { forUpdate: true });
  if (playerRow.travelStartedBucket === null) {
    throw new ValidationError('Aucun voyage en cours pour ce joueur.');
  }
  if (!isSea(playerRow.currentZone)) {
    throw new ValidationError('Le joueur doit être en mer pour terminer un voyage.');
  }

  const fromSea = playerRow.currentZone;
  const actualDurationBuckets = bucketId - playerRow.travelStartedBucket;

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
