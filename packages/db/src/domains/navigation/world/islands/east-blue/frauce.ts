import { defineIsland } from '../define-island.js';

export const FRAUCE = defineIsland({
  key: 'frauce',
  name: 'Royaume de Frauce',
  entrySubZone: 'frauce_port',
  subZones: {
    frauce_port: 'Port',
  },
});
