import { SUB_ZONES_BY_ISLAND, type SubZone, type Transaction } from '@one-piece/db';

import { ValidationError } from '../../../discord/errors.js';
import * as historyRepository from '../../history/index.js';
import * as playerRepository from '../../player/repository.js';
import { isSea } from '../utils/index.js';

type ChangeSubZoneParams = {
  playerId: number;
  targetSubZone: SubZone;
  bucketId: number;
  tx: Transaction;
};

export async function changeSubZone({ playerId, targetSubZone, bucketId, tx }: ChangeSubZoneParams): Promise<void> {
  const playerRow = await playerRepository.findByIdOrThrow(playerId, tx, { forUpdate: true });

  if (isSea(playerRow.currentZone)) {
    throw new ValidationError('Impossible de se déplacer dans une île : vous êtes en mer.');
  }
  if (!SUB_ZONES_BY_ISLAND[playerRow.currentZone].includes(targetSubZone)) {
    throw new ValidationError("Cette destination n'est pas sur l'île actuelle.");
  }
  if (playerRow.currentSubZone === targetSubZone) {
    throw new ValidationError('Vous êtes déjà à cet endroit.');
  }

  await playerRepository.updateSubZone(playerId, targetSubZone, tx);
  await historyRepository.appendHistory({
    type: 'player.subZoneChanged',
    actorPlayerId: playerId,
    bucketId,
    payload: { from: playerRow.currentSubZone, to: targetSubZone },
    client: tx,
  });
}
