import { defineIsland } from './define-island.js';

export const GOAT_ISLAND = defineIsland({
  key: 'goat_island',
  name: 'Goat Island',
  entrySubZone: 'goat_island_coast',
  subZones: {
    goat_island_coast: 'Côte de Goat Island',
  },
});
