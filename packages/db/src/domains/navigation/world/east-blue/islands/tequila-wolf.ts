import { defineIsland } from '../../utils/define-island.js';

export const TEQUILA_WOLF = defineIsland({
  key: 'tequila_wolf',
  name: 'Île Tequila Wolf',
  entrySubZone: 'tequila_wolf_coast',
  subZones: {
    tequila_wolf_coast: 'Côte',
  },
});
