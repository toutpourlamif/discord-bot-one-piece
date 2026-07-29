import { buildCharacterPath } from './build-character-path.js';
import type { CharacterTemplateSeed } from './types.js';

export const SABAODY_DATA: Array<CharacterTemplateSeed> = [
  {
    name: 'Eustass Kid',
    hp: 24,
    combat: 26,
    race: 'HUMAN',
    rarity: 'A',
    skills: ['CONQUERORS_HAKI'],
    path: buildCharacterPath('sabaody', 'eustass-kid'),
    devilFruitName: 'Jiki Jiki no Mi',
    description: 'Capitaine des Pirates de Kid, Supernova brutal qui plie le métal à sa volonté.',
  },
  {
    name: 'Basil Hawkins',
    hp: 18,
    combat: 23,
    race: 'HUMAN',
    rarity: 'B',
    path: buildCharacterPath('sabaody', 'basil-hawkins'),
    description: "Le Mage, Supernova énigmatique qui lit l'avenir dans ses cartes de tarot.",
  },
  {
    name: 'Monkey D. Luffy (Demalo Black)',
    hp: 14,
    combat: 12,
    race: 'HUMAN',
    rarity: 'D',
    path: buildCharacterPath('sabaody', 'demalo-black'),
    description: 'Le futur roi des pirates (ou pas..)',
  },
  {
    name: 'Roronoa Zoro (Manjaro)',
    hp: 12,
    combat: 11,
    race: 'HUMAN',
    rarity: 'D',
    path: buildCharacterPath('sabaody', 'manjaro'),
    description: 'Épéiste à trois sabres sans en maîtriser un seul.',
  },
  {
    name: 'Nico Robin (Cocoa)',
    hp: 9,
    combat: 7,
    race: 'HUMAN',
    rarity: 'D',
    path: buildCharacterPath('sabaody', 'cocoa'),
    description: "Archéologue autoproclamée qui sait lire les Hiéroglyphes (ah c'est pas les bons pictogrammes?..)",
  },
  {
    name: 'Usopp (Mounblutain)',
    hp: 10,
    combat: 8,
    race: 'HUMAN',
    rarity: 'D',
    path: buildCharacterPath('sabaody', 'mounblutain'),
    description: "Le tireur le moins précis de Grand Line, on raconte qu'il est capable de rater une cible à bout portant",
  },
  // TODO: Ajouter drip, chocolat nora gitsune
];
