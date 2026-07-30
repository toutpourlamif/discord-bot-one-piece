import { buildCharacterPath } from './build-character-path.js';
import type { CharacterTemplateSeed } from './types.js';

export const ARLONG_PARK_DATA: Array<CharacterTemplateSeed> = [
  {
    //TODO: mettre des vraies stats
    name: 'Arlong',
    hp: 10,
    combat: 10,
    types: ['WATER', 'FIGHTING'],
    race: 'FISHMAN',
    rarity: 'D',
    path: buildCharacterPath('arlong-park', 'arlong'),
    description: 'Homme poisson sans foi ni loi. Truand connu de tous, terrorise East blue.',
  },
];
