import { player, type Edge, type Transaction } from '@one-piece/db';
import { eq } from 'drizzle-orm';

import { ValidationError } from '../../../discord/errors.js';
import * as historyRepository from '../../history/index.js';
import * as playerRepository from '../../player/repository.js';

import { recordZoneChange } from './record-zone-change.js';

type StartTravelParams = {
  playerId: number;
  edge: Edge;
  etaBucket: number;
  bucketId: number;
  tx: Transaction;
};

export async function startTravel({ playerId, edge, etaBucket, bucketId, tx }: StartTravelParams): Promise<void> {
  const playerRow = await playerRepository.findByIdOrThrow(playerId, tx, { forUpdate: true });
  if (playerRow.currentZone !== edge.from) {
    throw new ValidationError(`Le joueur doit être à ${edge.from} pour démarrer ce voyage.`);
  }
  if (playerRow.travelTargetZone !== null) {
    throw new ValidationError('Un voyage est déjà en cours.');
  }

  await tx
    .update(player)
    .set({ travelTargetZone: edge.to, travelStartedBucket: bucketId, travelEtaBucket: etaBucket })
    .where(eq(player.id, playerId));

  await recordZoneChange({ playerId, newZone: edge.via, bucketId, tx });

  await historyRepository.appendHistory({
    type: 'travel.departed',
    actorPlayerId: playerId,
    bucketId,
    payload: { from: edge.from, to: edge.to, via: edge.via, etaBucket },
    client: tx,
  });
}
