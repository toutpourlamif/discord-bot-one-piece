import { defineIsland } from '../../utils/define-island.js';

export const POLE_STAR = defineIsland({
  key: 'pole_star',
  name: 'Archipel Pole Star',
  entrySubZone: 'loguetown_square',
  subZones: {
    loguetown_square: 'Place de Loguetown',
  },
});
