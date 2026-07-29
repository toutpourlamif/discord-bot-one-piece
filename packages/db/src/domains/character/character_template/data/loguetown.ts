import { buildCharacterPath } from './build-character-path.js';
import type { CharacterTemplateSeed } from './types.js';

export const LOGUETOWN_DATA: Array<CharacterTemplateSeed> = [
  {
    name: 'Alvida (Skinny)',
    hp: 11,
    combat: 12,
    race: 'HUMAN',
    rarity: 'C',
    path: buildCharacterPath('loguetown', 'alvida-skinny'),
    devilFruitName: 'Sube Sube no Mi',
    // TODO: Trouver une bonne desc
    description: 'Skinny de quoi toi',
  },
  {
    name: 'Smoker',
    hp: 16,
    combat: 20,
    race: 'HUMAN',
    rarity: 'C',
    path: buildCharacterPath('loguetown', 'smoker'),
    description: 'Marine obstiné qui poursuit les pirates sans relâche.',
  },
];
