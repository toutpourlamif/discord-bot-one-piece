import { defineIsland } from '../define-island.js';

export const DAWN = defineIsland({
  key: 'dawn',
  name: 'Dawn Island',
  entrySubZone: 'goa_kingdom',
  subZones: {
    goa_kingdom: 'Royaume de Goa',
    foosha_village: 'Village de Foosha',
  },
});
