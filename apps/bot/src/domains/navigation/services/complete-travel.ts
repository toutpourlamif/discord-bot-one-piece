import { db, type DbOrTransaction, type Island } from '@one-piece/db';

import { ValidationError } from '../../../discord/errors.js';
import type { ClientOptions } from '../../../shared/types.js';
import { isSea } from '../../event/generators/utils.js';
import type { Rng } from '../../event/types.js';
import * as historyRepository from '../../history/index.js';
import * as playerRepository from '../../player/repository.js';
import * as resourceRepository from '../../resource/repository.js';
import * as shipRepository from '../../ship/repository.js';
import { computeDriftProbability, pickDriftIsland } from '../utils/index.js';

import { recordZoneChange } from './record-zone-change.js';

type CompleteTravelParams = {
  playerId: number;
  bucketId: number;
  rng: Rng;
  options?: ClientOptions;
};

type CompleteTravelResult = { arrivedZone: Island; drifted: boolean };

/** Termine un voyage en cours et décide si on dérive ou pas */
export async function completeTravel({ playerId, bucketId, rng, options = {} }: CompleteTravelParams): Promise<CompleteTravelResult> {
  if (options.client) return runCompleteTravel(playerId, bucketId, rng, options.client);
  return db.transaction((tx) => runCompleteTravel(playerId, bucketId, rng, tx));
}

async function runCompleteTravel(playerId: number, bucketId: number, rng: Rng, client: DbOrTransaction): Promise<CompleteTravelResult> {
  const playerRow = await playerRepository.findByIdOrThrow(playerId, client, { forUpdate: true });
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
    shipRepository.findByPlayerIdOrThrow(playerId, client),
    resourceRepository.getInventory(playerId, client),
  ]);

  const driftProbability = computeDriftProbability({ ship, inventory, fromSea, intendedZone });
  const hasDrifted = rng.next() < driftProbability;
  const arrivedZone = hasDrifted ? pickDriftIsland(fromSea, intendedZone, rng) : intendedZone;

  await recordZoneChange({ playerId, newZone: arrivedZone, bucketId, options: { client } });
  await playerRepository.clearTravel(playerId, { client });

  if (hasDrifted) {
    await historyRepository.appendHistory({
      type: 'travel.drifted',
      actorPlayerId: playerId,
      bucketId,
      payload: { from: fromSea, intendedTo: intendedZone, actualTo: arrivedZone, actualDurationBuckets },
      client,
    });
  } else {
    await historyRepository.appendHistory({
      type: 'travel.arrived',
      actorPlayerId: playerId,
      bucketId,
      payload: { from: fromSea, to: arrivedZone, actualDurationBuckets },
      client,
    });
  }

  return { arrivedZone, drifted: hasDrifted };
}
