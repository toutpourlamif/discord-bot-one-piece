import { defineIsland } from '../define-island.js';

export const SIXIS = defineIsland({
  key: 'sixis',
  name: 'Île Sixis',
  entrySubZone: 'sixis_coast',
  subZones: {
    sixis_coast: 'Côte',
  },
});
