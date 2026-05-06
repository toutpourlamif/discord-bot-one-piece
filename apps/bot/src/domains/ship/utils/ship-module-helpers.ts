import { SHIP_MODULE_LEVEL_COLUMNS, type Ship, type ShipModuleKey } from '@one-piece/db';

import { ValidationError } from '../../../discord/errors.js';
import type { ResourceAmount } from '../../resource/types.js';
import { SHIP_MODULES } from '../modules.js';

export function getShipModuleLevel(ship: Ship, moduleKey: ShipModuleKey): number {
  return ship[SHIP_MODULE_LEVEL_COLUMNS[moduleKey]];
}

export function isShipModuleMaxLevel(moduleKey: ShipModuleKey, level: number): boolean {
  return level >= SHIP_MODULES[moduleKey].valueByLevel.length;
}

export function getShipModuleBerryCost(moduleKey: ShipModuleKey, level: number): bigint {
  assertIsNotMaxLevel(moduleKey, level);

  const cost = SHIP_MODULES[moduleKey].costByLevel[level - 1];
  return BigInt(cost?.berry ?? 0);
}

export function getShipModuleResourceCosts(moduleKey: ShipModuleKey, level: number): Array<ResourceAmount> {
  assertIsNotMaxLevel(moduleKey, level);

  const resources = SHIP_MODULES[moduleKey].costByLevel[level - 1]?.resources;
  if (!resources) return [];

  return (Object.entries(resources) as Array<[keyof typeof resources, number]>).map(([name, quantity]) => ({ name, quantity }));
}

function assertIsNotMaxLevel(moduleKey: ShipModuleKey, level: number): void {
  if (!isShipModuleMaxLevel(moduleKey, level)) return;

  throw new ValidationError('Ce module est déjà au niveau maximum.');
}
