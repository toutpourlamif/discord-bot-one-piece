import type { TavernKeeper } from '../../../../tavern/types.js';
import { defineIsland } from '../../utils/define-island.js';

// TODO: nom + assets (dossier + dialogue-*.webp) du tavernier d'Alabasta
const ALABASTA_KEEPER: TavernKeeper = { name: 'Terracotta', assetPath: 'characters/alabasta-kingdom/terracotta' };

export const ALABASTA = defineIsland({
  key: 'alabasta',
  name: 'Alabasta',
  entrySubZone: 'alabasta_nanohana',
  subZones: {
    alabasta_nanohana: 'Nanohana',
  },
  tavernConfig: {
    keeper: ALABASTA_KEEPER,
    activities: ['shop', 'recruit'],
  },
});
