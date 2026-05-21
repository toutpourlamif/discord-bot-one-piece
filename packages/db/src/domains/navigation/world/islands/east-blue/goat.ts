import { defineIsland } from '../define-island.js';

export const GOAT = defineIsland({
  key: 'goat',
  name: 'Goat Island',
  entrySubZone: 'coast',
  subZones: {
    coast: 'Côte de Goat Island',
  },
});
