import { SHIP_MODULE_LEVEL_COLUMNS, type ResourceName, type Ship, type ShipModuleKey } from '@one-piece/db';

import type { Inventory } from '../../resource/types.js';
import { SHIP_MODULES } from '../modules.js';
import type { ResourceCostPreview, ShipModuleUpgradePreview } from '../types.js';

type BuildShipModuleUpgradePreviewParams = {
  ship: Ship;
  moduleKey: ShipModuleKey;
  ownedBerries: bigint;
  inventory: Inventory;
};

export function buildShipModuleUpgradePreview({
  ship,
  moduleKey,
  ownedBerries,
  inventory,
}: BuildShipModuleUpgradePreviewParams): ShipModuleUpgradePreview {
  const level = ship[SHIP_MODULE_LEVEL_COLUMNS[moduleKey]];
  const nextLevel = level + 1;
  const module = SHIP_MODULES[moduleKey];
  const resources = getResourceCostPreviews(moduleKey, level, inventory);
  const berryCost = getShipModuleBerryCost(moduleKey, level);
  const hasEnoughBerry = ownedBerries >= berryCost;

  return {
    level,
    nextLevel,
    currentValue: module.valueByLevel[level - 1],
    nextValue: module.valueByLevel[nextLevel - 1],
    berryCost,
    ownedBerries,
    hasEnoughBerry,
    resources,
    canUpgrade: hasEnoughBerry && resources.every((resource) => resource.hasEnough),
  };
}

export function getShipModuleBerryCost(moduleKey: ShipModuleKey, level: number): bigint {
  const cost = SHIP_MODULES[moduleKey].costByLevel[level - 1];
  return BigInt(cost?.berry ?? 0);
}

export function getShipModuleResourceCosts(moduleKey: ShipModuleKey, level: number): Array<[ResourceName, number]> {
  const cost = SHIP_MODULES[moduleKey].costByLevel[level - 1];
  return Object.entries(cost?.resources ?? {}) as Array<[ResourceName, number]>;
}

function getResourceCostPreviews(moduleKey: ShipModuleKey, level: number, inventory: Inventory): Array<ResourceCostPreview> {
  const inventoryByName = new Map(inventory.map((item) => [item.name, item.quantity]));

  return getShipModuleResourceCosts(moduleKey, level).map(([name, requiredQuantity]) => {
    const ownedQuantity = inventoryByName.get(name) ?? 0;

    return {
      name,
      requiredQuantity,
      ownedQuantity,
      hasEnough: ownedQuantity >= requiredQuantity,
    };
  });
}
