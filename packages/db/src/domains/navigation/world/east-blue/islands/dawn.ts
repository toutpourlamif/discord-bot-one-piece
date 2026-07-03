import type { TavernKeeper } from '../../../../tavern/types.js';
import { defineIsland } from '../../utils/define-island.js';

// TODO: dialogues du tavernier de Dawn (le dossier a un sheet.webp mais pas encore de dialogue-*.webp)
const DAWN_KEEPER: TavernKeeper = { name: 'Makino', assetPath: 'characters/dawn-island/makino' };

export const DAWN = defineIsland({
  key: 'dawn',
  name: 'Île Dawn',
  entrySubZone: 'goa_kingdom',
  tavernConfig: { keeper: DAWN_KEEPER, activities: ['juste-prix'] },
  subZones: {
    goa_kingdom: 'Royaume de Goa',
    foosha_village: 'Village de Foosha',
  },
});
