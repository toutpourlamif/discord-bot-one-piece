import { defineIsland } from '../define-island.js';

export const DRUM = defineIsland({
  key: 'drum',
  name: 'Drum',
  entrySubZone: 'drum_village',
  subZones: {
    drum_village: 'Village de Drum',
  },
});
