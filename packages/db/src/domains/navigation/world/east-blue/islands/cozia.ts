import { defineIsland } from '../../utils/define-island.js';

export const COZIA = defineIsland({
  key: 'cozia',
  name: 'Cozia',
  entrySubZone: 'cozia_port',
  subZones: {
    cozia_port: 'Port',
  },
});
