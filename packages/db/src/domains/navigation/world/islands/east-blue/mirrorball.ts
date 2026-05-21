import { defineIsland } from '../define-island.js';

export const MIRRORBALL = defineIsland({
  key: 'mirrorball',
  name: 'Île Mirrorball',
  entrySubZone: 'mirrorball_coast',
  subZones: {
    mirrorball_coast: 'Côte',
  },
});
