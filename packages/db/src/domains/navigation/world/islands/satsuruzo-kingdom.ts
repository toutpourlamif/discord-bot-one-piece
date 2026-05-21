import { defineIsland } from './define-island.js';

export const SATSURUZO_KINGDOM = defineIsland({
  key: 'satsuruzo_kingdom',
  name: 'Royaume de Satsuruzo',
  entrySubZone: 'satsuruzo_port',
  subZones: {
    satsuruzo_port: 'Port de Satsuruzo',
  },
});
