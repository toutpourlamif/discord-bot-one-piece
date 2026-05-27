import { defineIsland } from '../../utils/define-island.js';

export const OYKOT = defineIsland({
  key: 'oykot',
  name: "Royaume d'Oykot",
  entrySubZone: 'oykot_port',
  subZones: {
    oykot_port: 'Port',
  },
});
