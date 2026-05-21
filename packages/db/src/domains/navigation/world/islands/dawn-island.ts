import { defineIsland } from './define-island.js';

export const DAWN_ISLAND = defineIsland({
  key: 'dawn_island',
  name: 'Dawn Island',
  entrySubZone: 'dawn_goa_kingdom',
  subZones: {
    dawn_goa_kingdom: 'Royaume de Goa : Centre ville',
    dawn_foosha_village: 'Village de Foosha',
  },
});
