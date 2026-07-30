import { buildCharacterPath } from './build-character-path.js';
import type { CharacterTemplateSeed } from './types.js';

export const JAYA_DATA: Array<CharacterTemplateSeed> = [
  {
    name: 'Marshall D. Teach',
    hp: 30,
    combat: 28,
    race: 'HUMAN',
    rarity: 'S',
    path: buildCharacterPath('jaya', 'marshall-d-teach'),
    devilFruitName: 'Yami Yami no Mi',
    description: 'Capitaine des Pirates de Barbe Noire, seul homme connu à porter deux fruits du démon.',
  },
];
