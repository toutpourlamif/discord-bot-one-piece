import type { ResourceName } from '@one-piece/db';

export type ShipTemplateState = {
  templateKey: string;
  name: string;
  hp: number;
  hullLevel: number;
  sailLevel: number;
  decksLevel: number;
  cabinsLevel: number;
  cargoLevel: number;
};

export type ResourceCostPreview = {
  name: ResourceName;
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
