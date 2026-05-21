import { defineIsland } from '../define-island.js';

export const GOAT = defineIsland({
  key: 'goat',
  name: 'Île Goat',
  entrySubZone: 'coast',
  subZones: {
    coast: 'Côte',
  },
});
