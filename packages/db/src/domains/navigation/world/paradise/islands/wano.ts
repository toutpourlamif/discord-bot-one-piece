import { defineIsland } from '../../utils/define-island.js';

// TODO: Move dans NEW WORLD qunand on implémentera
export const WANO = defineIsland({
  key: 'wano',
  name: 'Wano',
  entrySubZone: 'wano_flower_capital',
  subZones: {
    wano_flower_capital: 'Capitale des Fleurs',
  },
});
