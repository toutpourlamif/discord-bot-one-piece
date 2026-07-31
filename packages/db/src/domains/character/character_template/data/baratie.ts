import { buildCharacterPath } from './build-character-path.js';
import type { CharacterTemplateSeed } from './types.js';

export const BARATIE_DATA: Array<CharacterTemplateSeed> = [
  {
    name: 'Dracule Mihawk',
    hp: 24,
    combat: 30,
    race: 'HUMAN',
    rarity: 'S',
    path: buildCharacterPath('baratie', 'dracule-mihawk'),
    description: 'Le plus grand épéiste du monde, calme et impitoyable.',
  },
  {
    name: 'Don Krieg',
    hp: 13,
    combat: 15,
    race: 'HUMAN',
    rarity: 'D',
    types: ['STEEL'],
    path: buildCharacterPath('baratie', 'don-krieg'),
    description: "Chef pirate d'East Blue, dangereux surtout par son arsenal.",
  },
];
