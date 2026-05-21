import { defineIsland } from '../define-island.js';

export const YOTSUBA = defineIsland({
  key: 'yotsuba',
  name: 'Yotsuba Island',
  entrySubZone: 'shells_town',
  subZones: {
    shells_town: 'Shells Town',
    shimotsuki_village: 'Village Shimotsuki',
  },
});
