import { defineIsland } from '../define-island.js';

export const MIRRORBALL = defineIsland({
  key: 'mirrorball',
  name: 'Mirrorball Island',
  entrySubZone: 'mirrorball_coast',
  subZones: {
    mirrorball_coast: 'Côte de Mirrorball Island',
  },
});
