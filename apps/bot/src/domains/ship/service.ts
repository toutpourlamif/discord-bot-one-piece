import { db, SHIP_MODULE_LEVEL_COLUMNS, type DbOrTransaction, type Ship, type ShipModuleKey } from '@one-piece/db';

import { ValidationError } from '../../discord/errors.js';
import { sanitizeName } from '../../shared/sanitize-name.js';
import * as economyRepository from '../economy/repository.js';
import * as playerRepository from '../player/repository.js';
import * as resourceRepository from '../resource/repository.js';
import { debitResourcesByName } from '../resource/service.js';

import { MAX_SHIP_NAME_LENGTH } from './constants.js';
import * as shipRepository from './repository.js';
import type { ShipModuleUpgradePreview } from './types.js';
import { buildShipModuleUpgradePreview, getShipModuleBerryCost, getShipModuleResourceCosts } from './utils/index.js';

export class ShipNameValidationError extends Error {}

type FindOrCreateResult = { ship: Ship; created: boolean };

export type { ShipModuleUpgradePreview };

export async function findOrCreateShip(
  playerId: number,
  name = 'Navire sans nom',
  client: DbOrTransaction = db,
): Promise<FindOrCreateResult> {
  const existing = await shipRepository.findByPlayerId(playerId, client);
  if (existing) return { ship: existing, created: false };
  const created = await shipRepository.create(playerId, name, client);
  return { ship: created, created: true };
}

export async function renameShip(playerId: number, newName: string): Promise<Ship> {
  const sanitized = sanitizeName(newName);
  if (sanitized.length === 0) {
    throw new ShipNameValidationError('Tu dois donner un nom.');
  }
  if (sanitized.length > MAX_SHIP_NAME_LENGTH) {
    throw new ShipNameValidationError(`Le nom du bateau ne peut pas dépasser ${MAX_SHIP_NAME_LENGTH} caractères.`);
  }
  const { ship } = await findOrCreateShip(playerId);
  return shipRepository.rename(ship.id, sanitized);
}

export async function getShipModuleUpgradePreview(playerId: number, moduleKey: ShipModuleKey): Promise<ShipModuleUpgradePreview> {
  const [ship, player, inventory] = await Promise.all([
    shipRepository.findByPlayerIdOrThrow(playerId),
    playerRepository.findByIdOrThrow(playerId),
    resourceRepository.getInventory(playerId),
  ]);

  return buildShipModuleUpgradePreview({
    ship,
    moduleKey,
    ownedBerries: player.berries,
    inventory,
  });
}

export async function upgradeShipModule(playerId: number, moduleKey: ShipModuleKey, expectedLevel: number): Promise<Ship> {
  return db.transaction(async (transaction) => {
    const ship = await shipRepository.findByPlayerIdOrThrow(playerId, transaction, { forUpdate: true });
    const level = ship[SHIP_MODULE_LEVEL_COLUMNS[moduleKey]];
    if (level !== expectedLevel) {
      throw new ValidationError('Cette amélioration a déjà été prise en compte.');
    }

    const nextLevel = level + 1;
    const berryCost = getShipModuleBerryCost(moduleKey, level);
    if (berryCost > 0n) {
      await economyRepository.debitBerry(playerId, berryCost, transaction);
    }

    await debitResourcesByName(
      playerId,
      getShipModuleResourceCosts(moduleKey, level).map(([name, quantity]) => ({ name, quantity })),
      transaction,
    );

    return shipRepository.updateModuleLevel(ship.id, moduleKey, nextLevel, transaction);
  });
}
