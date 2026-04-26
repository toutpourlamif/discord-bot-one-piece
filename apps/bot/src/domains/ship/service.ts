import type { Ship } from '@one-piece/db';

import { MAX_SHIP_NAME_LENGTH } from './constants.js';
import * as shipRepository from './repository.js';

export class ShipNameValidationError extends Error {}

type FindOrCreateResult = { ship: Ship; created: boolean };

export async function findOrCreateShip(playerId: number, name = 'Navire sans nom'): Promise<FindOrCreateResult> {
  const existing = await shipRepository.findByPlayerId(playerId);
  if (existing) return { ship: existing, created: false };
  const created = await shipRepository.create(playerId, name);
  return { ship: created, created: true };
}

export async function renameShip(playerId: number, newName: string): Promise<Ship> {
  if (!newName.trim()) {
    throw new ShipNameValidationError('Le nom du bateau ne peut pas être vide.');
  }
  if (newName.length > MAX_SHIP_NAME_LENGTH) {
    throw new ShipNameValidationError(`Le nom du bateau ne peut pas dépasser ${MAX_SHIP_NAME_LENGTH} caractères.`);
  }
  const { ship } = await findOrCreateShip(playerId);
  return shipRepository.rename(ship.id, newName.trim());
}
