import { db, SHIP_MODULE_LEVEL_COLUMNS, type DbOrTransaction, type ResourceName, type Ship, type ShipModuleKey } from '@one-piece/db';

import { ValidationError } from '../../discord/errors.js';
import { sanitizeName } from '../../shared/sanitize-name.js';
import { InsufficientFundsError } from '../economy/errors.js';
import * as economyRepository from '../economy/repository.js';
import * as playerRepository from '../player/repository.js';
import * as resourceRepository from '../resource/repository.js';

import { MAX_SHIP_NAME_LENGTH } from './constants.js';
import { SHIP_MODULES } from './modules.js';
import * as shipRepository from './repository.js';

export class ShipNameValidationError extends Error {}

type FindOrCreateResult = { ship: Ship; created: boolean };

type ResourceCostPreview = {
  name: string;
  requiredQuantity: number;
  ownedQuantity: number;
  hasEnough: boolean;
};

export type ShipModuleUpgradePreview = {
  level: number;
  nextLevel: number;
  currentValue: number | undefined;
  nextValue: number | undefined;
  berryCost: bigint;
  ownedBerries: bigint;
  hasEnoughBerry: boolean;
  resources: Array<ResourceCostPreview>;
  canUpgrade: boolean;
};

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

  const level = ship[SHIP_MODULE_LEVEL_COLUMNS[moduleKey]];
  const nextLevel = level + 1;
  const module = SHIP_MODULES[moduleKey];
  const cost = module.costByLevel[level - 1];
  const inventoryByName = new Map(inventory.map((item) => [item.name, item.quantity]));
  const berryCost = BigInt(cost?.berry ?? 0);

  const resources = getResourceCosts(moduleKey, level).map(([name, requiredQuantity]) => {
    const ownedQuantity = inventoryByName.get(name) ?? 0;

    return {
      name,
      requiredQuantity,
      ownedQuantity,
      hasEnough: ownedQuantity >= requiredQuantity,
    };
  });

  const hasEnoughBerry = player.berries >= berryCost;

  return {
    level,
    nextLevel,
    currentValue: module.valueByLevel[level - 1],
    nextValue: module.valueByLevel[nextLevel - 1],
    berryCost,
    ownedBerries: player.berries,
    hasEnoughBerry,
    resources,
    canUpgrade: hasEnoughBerry && resources.every((resource) => resource.hasEnough),
  };
}

function getResourceCosts(moduleKey: ShipModuleKey, level: number): Array<[ResourceName, number]> {
  const cost = SHIP_MODULES[moduleKey].costByLevel[level - 1];
  return Object.entries(cost?.resources ?? {}) as Array<[ResourceName, number]>;
}

export async function upgradeShipModule(playerId: number, moduleKey: ShipModuleKey, expectedLevel: number): Promise<Ship> {
  return db.transaction(async (transaction) => {
    const ship = await shipRepository.findByPlayerIdForUpdateOrThrow(playerId, transaction);
    const level = ship[SHIP_MODULE_LEVEL_COLUMNS[moduleKey]];
    if (level !== expectedLevel) {
      throw new ValidationError('Cette amélioration a déjà été prise en compte.');
    }

    const nextLevel = level + 1;
    const cost = SHIP_MODULES[moduleKey].costByLevel[level - 1];

    const berryCost = BigInt(cost?.berry ?? 0);
    if (berryCost > 0n) {
      const newBalance = await economyRepository.debitBerry(playerId, berryCost, transaction);
      if (newBalance === null) throw new InsufficientFundsError();
    }

    for (const [resourceName, quantity] of getResourceCosts(moduleKey, level)) {
      const debited = await resourceRepository.debitResourceByName(playerId, resourceName, quantity, transaction);
      if (!debited) {
        throw new ValidationError(`Ressource insuffisante : ${resourceName}.`);
      }
    }

    return shipRepository.updateModuleLevel(ship.id, moduleKey, nextLevel, transaction);
  });
}
