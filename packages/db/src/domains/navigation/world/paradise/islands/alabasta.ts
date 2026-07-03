import type { TavernKeeper } from '../../../../tavern/types.js';
import { defineIsland } from '../../utils/define-island.js';

// TODO: nom + assets (dossier + dialogue-*.webp) du tavernier d'Alabasta
const ALABASTA_TAVERN_KEEPER: TavernKeeper = {
  name: 'Terracotta',
  assetPath: 'characters/alabasta/terracotta',
  // TODO: vraies répliques d'accueil de Terracotta
  greetingLines: ['Bienvenue à Alabasta, voyageur !', 'Pose-toi à l’ombre, il fait une chaleur de désert dehors.'],
};

export const ALABASTA = defineIsland({
  key: 'alabasta',
  name: 'Alabasta',
  entrySubZone: 'alabasta_nanohana',
  subZones: {
    alabasta_nanohana: 'Nanohana',
  },
  tavernConfig: {
    tavernKeeper: ALABASTA_TAVERN_KEEPER,
    activities: ['shop', 'recruit'],
  },
});
