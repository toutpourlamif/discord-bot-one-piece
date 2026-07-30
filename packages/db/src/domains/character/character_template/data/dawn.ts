import { buildCharacterPath } from './build-character-path.js';
import type { CharacterTemplateSeed } from './types.js';

export const DAWN_DATA: Array<CharacterTemplateSeed> = [
  {
    // TODO: Remplacer par l'animal pour l'onboarding
    name: 'Koby',
    hp: 8,
    combat: 6,
    race: 'HUMAN',
    // TODO: ajouter assets/characters/dawn/koby-young/info.webp (seuls les dialogue-*.webp existent actuellement)
    path: buildCharacterPath('dawn', 'koby-young'),
    description: 'Jeune marine paumé, recruté sur les quais de Dawn Island.',
  },
];
