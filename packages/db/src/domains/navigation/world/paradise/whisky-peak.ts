import { defineIsland } from '../define-island.js';

export const WHISKY_PEAK = defineIsland({
  key: 'whisky_peak',
  name: 'Whisky Peak',
  entrySubZone: 'whisky_peak_town',
  subZones: {
    whisky_peak_town: 'Ville de Whisky Peak',
  },
});
