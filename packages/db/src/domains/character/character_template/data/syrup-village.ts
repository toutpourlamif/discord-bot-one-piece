import { buildCharacterPath } from './build-character-path.js';
import type { CharacterTemplateSeed } from './types.js';

export const SYRUP_VILLAGE_DATA: Array<CharacterTemplateSeed> = [
  {
    name: 'Kuro',
    hp: 10,
    combat: 10,
    race: 'HUMAN',
    types: ['NORMAL', 'STEEL'],
    rarity: 'D',
    path: buildCharacterPath('syrup-village', 'kuro'),
    description: 'Capitaine de l`équipage des chats noirs, Kuro est un sociopathe sadique munis de griffes en métal',
  },
];
