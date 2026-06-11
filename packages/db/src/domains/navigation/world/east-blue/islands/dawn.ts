import { defineIsland } from '../../utils/define-island.js';

export const DAWN = defineIsland({
  key: 'dawn',
  name: 'Île Dawn',
  entrySubZone: 'goa_kingdom',
  tavernConfig: { activities: ['juste-prix'] },
  subZones: {
    goa_kingdom: 'Royaume de Goa',
    foosha_village: 'Village de Foosha',
  },
});
