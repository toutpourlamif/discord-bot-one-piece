import type { ResourceName, ShipModuleKey } from '@one-piece/db';

type UpgradeCost = {
  berry?: number;
  resources?: Partial<Record<ResourceName, number>>;
};

type ShipModuleConfig = {
  valueByLevel: Array<number>;
  costByLevel: Array<UpgradeCost>;
};

// TODO: Équilibrer les valeurs, ajouter des vrais ressources
// TODO: déplacer `SHIP_MODULES` (data statique du schéma) dans `packages/db/src/domains/ship/`,
// au même titre que `WORLD_EDGES` / `ZONES`. Les labels FR restent côté bot.
export const SHIP_MODULES = {
  hull: {
    valueByLevel: [100, 150, 220, 320, 450],
    costByLevel: [
      { berry: 500, resources: { Bois: 10 } },
      { berry: 1500, resources: { Bois: 25, Fer: 5 } },
      { berry: 4000, resources: { Bois: 50, Fer: 15 } },
      { berry: 10000, resources: { Bois: 100, Fer: 40 } },
    ],
  },
  sail: {
    valueByLevel: [10, 14, 18, 23, 28],
    costByLevel: [
      { berry: 400, resources: { Bois: 8 } },
      { berry: 1200, resources: { Bois: 20 } },
      { berry: 3500, resources: { Bois: 45, Fer: 10 } },
      { berry: 9000, resources: { Bois: 90, Fer: 30 } },
    ],
  },
  decks: {
    valueByLevel: [3, 4, 5, 6, 7],
    costByLevel: [
      { berry: 800, resources: { Bois: 15 } },
      { berry: 2500, resources: { Bois: 35, Fer: 8 } },
      { berry: 7000, resources: { Bois: 70, Fer: 25 } },
      { berry: 18000, resources: { Bois: 140, Fer: 60 } },
    ],
  },
  cabins: {
    valueByLevel: [2, 4, 6, 9, 12],
    costByLevel: [
      { berry: 600, resources: { Bois: 12 } },
      { berry: 1800, resources: { Bois: 30, Fer: 5 } },
      { berry: 5000, resources: { Bois: 60, Fer: 18 } },
      { berry: 13000, resources: { Bois: 120, Fer: 45 } },
    ],
  },
  cargo: {
    valueByLevel: [20, 35, 55, 80, 110],
    costByLevel: [
      { berry: 500, resources: { Bois: 12 } },
      { berry: 1500, resources: { Bois: 28, Fer: 6 } },
      { berry: 4200, resources: { Bois: 55, Fer: 20 } },
      { berry: 11000, resources: { Bois: 110, Fer: 50 } },
    ],
  },
} as const satisfies Record<ShipModuleKey, ShipModuleConfig>;

export const SHIP_MODULE_LABELS = {
  hull: 'Coque',
  sail: 'Voile',
  decks: 'Ponts',
  cabins: 'Chambres',
  cargo: 'Cale',
} as const satisfies Record<ShipModuleKey, string>;
