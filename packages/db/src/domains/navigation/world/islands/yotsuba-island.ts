import { defineIsland } from './define-island.js';

export const YOTSUBA_ISLAND = defineIsland({
  key: 'yotsuba_island',
  name: 'Yotsuba Island',
  entrySubZone: 'yotsuba_shells_town',
  subZones: {
    yotsuba_shells_town: 'Shells Town',
    yotsuba_shimotsuki_village: 'Village Shimotsuki',
  },
});
