import { db, SHIP_MODULE_LEVEL_COLUMNS, type Ship, type ShipModuleKey } from '@one-piece/db';

import { ValidationError } from '../../../discord/errors.js';
import * as economyRepository from '../../economy/repository.js';
import { debitResourcesByName } from '../../resource/service.js';
import * as shipRepository from '../repository.js';
import { getShipModuleBerryCost, getShipModuleResourceCosts } from '../utils/index.js';

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

    await debitResourcesByName(playerId, getShipModuleResourceCosts(moduleKey, level), transaction);

    return shipRepository.updateModuleLevel(ship.id, moduleKey, nextLevel, transaction);
  });
}
