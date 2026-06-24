import { db, type Ship } from '@one-piece/db';

import { ValidationError } from '../../../discord/errors.js';
import { sanitizeName } from '../../../shared/sanitize-name.js';
import * as historyRepository from '../../history/index.js';
import { MAX_SHIP_NAME_LENGTH } from '../constants.js';
import * as shipRepository from '../repository.js';

import { findOrCreateShip } from './find-or-create-ship.js';

export async function renameShip(playerId: number, newName: string): Promise<Ship> {
  const sanitized = sanitizeName(newName);
  if (sanitized.length === 0) {
    throw new ValidationError('Tu dois donner un nom.');
  }
  if (sanitized.length > MAX_SHIP_NAME_LENGTH) {
    throw new ValidationError(`Le nom du bateau ne peut pas dépasser ${MAX_SHIP_NAME_LENGTH} caractères.`);
  }
  return db.transaction(async (transaction) => {
    const { ship } = await findOrCreateShip(playerId, transaction);
    const renamed = await shipRepository.rename(ship.id, sanitized, transaction);

    await historyRepository.appendHistory({
      type: 'ship.renamed',
      payload: {
        oldName: ship.name,
        newName: renamed.name,
      },
      actorPlayerId: playerId,
      target: { type: 'ship', id: renamed.id },
      client: transaction,
    });

    return renamed;
  });
}
