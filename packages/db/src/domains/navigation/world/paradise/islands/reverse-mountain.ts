import { defineIsland } from '../../utils/define-island.js';

export const REVERSE_MOUNTAIN = defineIsland({
  key: 'reverse_mountain',
  name: 'Reverse Mountain',
  entrySubZone: 'reverse_mountain_twin_cape',
  subZones: {
    reverse_mountain_twin_cape: 'Cap des Jumeaux',
  },
});
