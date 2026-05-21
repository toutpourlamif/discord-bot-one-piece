import { defineIsland } from '../define-island.js';

export const TEQUILA_WOLF = defineIsland({
  key: 'tequila_wolf',
  name: 'Tequila Wolf',
  entrySubZone: 'tequila_wolf_coast',
  subZones: {
    tequila_wolf_coast: 'Côte de Tequila Wolf',
  },
});
