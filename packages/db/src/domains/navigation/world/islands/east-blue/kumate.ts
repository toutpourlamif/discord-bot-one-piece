import { defineIsland } from '../define-island.js';

export const KUMATE = defineIsland({
  key: 'kumate',
  name: 'Île Kumate',
  entrySubZone: 'kumate_coast',
  subZones: {
    kumate_coast: 'Côte',
  },
});
