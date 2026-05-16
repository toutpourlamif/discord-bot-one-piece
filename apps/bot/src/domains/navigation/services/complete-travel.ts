import { type Island, type Transaction } from '@one-piece/db';

import { ValidationError } from '../../../discord/errors.js';
import type { Rng } from '../../event/types.js';
import * as historyRepository from '../../history/index.js';
import * as playerRepository from '../../player/repository.js';
import * as resourceRepository from '../../resource/repository.js';
import * as shipRepository from '../../ship/repository.js';
import { computeDriftProbability, isSea, pickDriftIsland } from '../utils/index.js';

import { recordZoneChange } from './record-zone-change.js';

type CompleteTravelParams = {
  playerId: number;
  bucketId: number;
  rng: Rng;
  tx: Transaction;
};

type CompleteTravelResult = { arrivedZone: Island; drifted: boolean };

/** Termine un voyage en cours et décide si on dérive ou pas */
export async function completeTravel({ playerId, bucketId, rng, tx }: CompleteTravelParams): Promise<CompleteTravelResult> {
  const playerRow = await playerRepository.findByIdOrThrow(playerId, tx, { forUpdate: true });
  if (playerRow.travelTargetZone === null || playerRow.travelStartedBucket === null) {
    throw new ValidationError('Aucun voyage en cours pour ce joueur.');
  }
  if (!isSea(playerRow.currentZone)) {
    throw new ValidationError('Le joueur doit être en mer pour terminer un voyage.');
  }

  const intendedZone = playerRow.travelTargetZone;
  const fromSea = playerRow.currentZone;
  const actualDurationBuckets = bucketId - playerRow.travelStartedBucket;

  const [ship, inventory] = await Promise.all([
    shipRepository.findByPlayerIdOrThrow(playerId, tx),
    resourceRepository.getInventory(playerId, tx),
  ]);

  const driftProbability = computeDriftProbability({ ship, inventory, fromSea, intendedZone });
  const hasDrifted = rng.next() < driftProbability;
  const arrivedZone = hasDrifted ? pickDriftIsland(fromSea, intendedZone, rng) : intendedZone;

  await recordZoneChange({ playerId, newZone: arrivedZone, bucketId, tx });
  await playerRepository.clearTravel(playerId, { client: tx });

  if (hasDrifted) {
    await historyRepository.appendHistory({
      type: 'travel.drifted',
      actorPlayerId: playerId,
      bucketId,
      payload: { from: fromSea, intendedTo: intendedZone, actualTo: arrivedZone, actualDurationBuckets },
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

  return { arrivedZone, drifted: hasDrifted };
}
