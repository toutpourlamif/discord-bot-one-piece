import { db, type Zone } from '@one-piece/db';

import { ValidationError } from '../../../discord/errors.js';
import type { ClientOptions } from '../../../shared/types.js';
import * as historyRepository from '../../history/index.js';
import * as playerRepository from '../../player/repository.js';

type RecordZoneChangeParams = {
  playerId: number;
  newZone: Zone;
  bucketId: number;
  options?: ClientOptions;
};

export async function recordZoneChange({ playerId, newZone, bucketId, options = {} }: RecordZoneChangeParams): Promise<void> {
  const { client = db } = options;
  const currentPlayer = await playerRepository.findByIdOrThrow(playerId, client);
  const from = currentPlayer.currentZone;

  if (from === newZone) throw new ValidationError('Vous êtes déjà à cet endroit');

  await playerRepository.updateZone(playerId, newZone, client);
  await historyRepository.appendHistory({
    type: 'player.zone_changed',
    actorPlayerId: playerId,
    bucketId,
    payload: { from, to: newZone },
    client,
  });
}
