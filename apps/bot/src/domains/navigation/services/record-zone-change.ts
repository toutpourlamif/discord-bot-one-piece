import { type Transaction, type Zone } from '@one-piece/db';

import { ValidationError } from '../../../discord/errors.js';
import * as historyRepository from '../../history/index.js';
import * as playerRepository from '../../player/repository.js';

type RecordZoneChangeParams = {
  playerId: number;
  newZone: Zone;
  bucketId: number;
  tx: Transaction;
};

export async function recordZoneChange({ playerId, newZone, bucketId, tx }: RecordZoneChangeParams): Promise<void> {
  const currentPlayer = await playerRepository.findByIdOrThrow(playerId, tx);
  const from = currentPlayer.currentZone;

  if (from === newZone) throw new ValidationError('Vous êtes déjà à cet endroit');

  await playerRepository.updateZone(playerId, newZone, tx);
  await historyRepository.appendHistory({
    type: 'player.zone_changed',
    actorPlayerId: playerId,
    bucketId,
    payload: { from, to: newZone },
    client: tx,
  });
}
