import { player, type Edge, type Transaction } from '@one-piece/db';
import { eq } from 'drizzle-orm';

import { ValidationError } from '../../../discord/errors.js';
import * as historyRepository from '../../history/index.js';
import * as playerRepository from '../../player/repository.js';
import { isSea } from '../utils/index.js';

import { recordZoneChange } from './record-zone-change.js';

type UpdateTravelTargetParams = {
  playerId: number;
  newEdge: Edge;
  newEtaBucket: number;
  bucketId: number;
  tx: Transaction;
};

export async function updateTravelTarget({ playerId, newEdge, newEtaBucket, bucketId, tx }: UpdateTravelTargetParams): Promise<void> {
  const playerRow = await playerRepository.findByIdOrThrow(playerId, tx, { forUpdate: true });
  if (!isSea(playerRow.currentZone)) {
    throw new ValidationError('Le joueur doit être en mer pour dévier.');
  }
  if (playerRow.travelTargetZone === null) {
    throw new ValidationError('Aucun voyage en cours pour ce joueur.');
  }
  const originalTo = playerRow.travelTargetZone;

  await tx.update(player).set({ travelTargetZone: newEdge.to, travelEtaBucket: newEtaBucket }).where(eq(player.id, playerId));

  if (playerRow.currentZone !== newEdge.via) {
    await recordZoneChange({ playerId, newZone: newEdge.via, bucketId, tx });
  }

  await historyRepository.appendHistory({
    type: 'travel.rerouted',
    actorPlayerId: playerId,
    bucketId,
    payload: { from: newEdge.from, originalTo, newTo: newEdge.to },
    client: tx,
  });
}
