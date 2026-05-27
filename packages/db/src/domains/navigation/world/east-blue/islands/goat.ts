import { defineIsland } from '../../utils/define-island.js';

export const GOAT = defineIsland({
  key: 'goat',
  name: 'Île Goat',
  entrySubZone: 'goat_coast',
  subZones: {
    goat_coast: 'Côte',
  },
});
