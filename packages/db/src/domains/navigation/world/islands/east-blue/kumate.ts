import { defineIsland } from '../define-island.js';

export const KUMATE = defineIsland({
  key: 'kumate',
  name: 'Kumate Island',
  entrySubZone: 'kumate_coast',
  subZones: {
    kumate_coast: 'Côte de Kumate Island',
  },
});
