import type { Ship, ShipModuleKey } from '@one-piece/db';

import type { Inventory } from '../../resource/types.js';
import { SHIP_MODULES } from '../modules.js';
import type { ResourceCostPreview, ShipModuleUpgradePreview } from '../types.js';

import { getShipModuleBerryCost, getShipModuleLevel, getShipModuleResourceCosts, isShipModuleMaxLevel } from './ship-module-helpers.js';

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
}: BuildShipModuleUpgradePreviewParams): ShipModuleUpgradePreview | null {
  const level = getShipModuleLevel(ship, moduleKey);
  if (isShipModuleMaxLevel(moduleKey, level)) return null;

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

function getResourceCostPreviews(moduleKey: ShipModuleKey, level: number, inventory: Inventory): Array<ResourceCostPreview> {
  const inventoryByName = new Map(inventory.map((item) => [item.name, item.quantity]));

  return getShipModuleResourceCosts(moduleKey, level).map(({ name, quantity: requiredQuantity }) => {
    const ownedQuantity = inventoryByName.get(name) ?? 0;

    return {
      name,
      requiredQuantity,
      ownedQuantity,
      hasEnough: ownedQuantity >= requiredQuantity,
    };
  });
}
