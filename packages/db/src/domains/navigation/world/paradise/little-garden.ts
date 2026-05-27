import { defineIsland } from '../define-island.js';

export const LITTLE_GARDEN = defineIsland({
  key: 'little_garden',
  name: 'Little Garden',
  entrySubZone: 'little_garden_jungle',
  subZones: {
    little_garden_jungle: 'Jungle de Little Garden',
  },
});
