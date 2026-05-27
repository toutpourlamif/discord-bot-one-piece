import { defineIsland } from '../../utils/define-island.js';

export const RARE_ANIMAL = defineIsland({
  key: 'rare_animal',
  name: 'Île des Animaux Rares',
  entrySubZone: 'rare_animal_coast',
  subZones: {
    rare_animal_coast: 'Côte',
  },
});
