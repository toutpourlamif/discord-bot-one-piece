import { defineIsland } from './define-island.js';

export const LOGUETOWN = defineIsland({
  key: 'loguetown',
  name: 'Loguetown',
  entrySubZone: 'loguetown_square',
  subZones: {
    loguetown_square: 'Place de Loguetown',
  },
});
