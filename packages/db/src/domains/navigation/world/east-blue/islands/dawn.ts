import type { TavernKeeper } from '../../../../tavern/types.js';
import { defineIsland } from '../../utils/define-island.js';

// TODO: dialogues du tavernier de Dawn (le dossier a un sheet.webp mais pas encore de dialogue-*.webp)
const DAWN_TAVERN_KEEPER: TavernKeeper = {
  name: 'Koby',
  assetPath: 'characters/marines/koby-young',
  // TODO: vraies répliques d'accueil de Koby
  greetingLines: ['Bienvenue à la taverne, moussaillon !', "Installe-toi, qu'est-ce que je te sers ?", 'Weeee bg bien ?'],
};

export const DAWN = defineIsland({
  key: 'dawn',
  name: 'Île Dawn',
  entrySubZone: 'goa_kingdom',
  tavernConfig: { tavernKeeper: DAWN_TAVERN_KEEPER, activities: ['juste-prix'] },
  subZones: {
    goa_kingdom: 'Royaume de Goa',
    foosha_village: 'Village de Foosha',
  },
});
