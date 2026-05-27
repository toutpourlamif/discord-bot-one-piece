import { defineIsland } from '../define-island.js';

export const NAGAGUTSU = defineIsland({
  key: 'nagagutsu',
  name: 'Royaume de Nagagutsu',
  entrySubZone: 'nagagutsu_port',
  subZones: {
    nagagutsu_port: 'Port',
  },
});
