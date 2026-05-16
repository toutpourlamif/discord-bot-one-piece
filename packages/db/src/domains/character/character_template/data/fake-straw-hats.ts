import type { CharacterTemplateSeed } from './types.js';

export const FAKE_STRAW_HATS_DATA: Array<CharacterTemplateSeed> = [
  {
    name: 'Monkey D. Luffy (Demalo Black)',
    hp: 14,
    combat: 12,
    race: 'HUMAN',
    rarity: 'COMMON',
    imageUrl: 'characters/fake-straw-hats/demalo-black.webp',
    description: 'Le futur roi des pirates (ou pas..)',
  },
  {
    name: 'Roronoa Zoro (Manjaro)',
    hp: 12,
    combat: 11,
    race: 'HUMAN',
    rarity: 'COMMON',
    imageUrl: 'characters/fake-straw-hats/manjaro.webp',
    description: 'Épéiste à trois sabres sans en maîtriser un seul.',
  },
  {
    name: 'Nico Robin (Cocoa)',
    hp: 9,
    combat: 7,
    race: 'HUMAN',
    rarity: 'COMMON',
    imageUrl: 'characters/fake-straw-hats/cocoa.webp',
    description: "Archéologue autoproclamée qui sait lire les Hiéroglyphes (ah c'est pas les bons pictogrammes?..)",
  },
  {
    name: 'Usopp (Mounblutain)',
    hp: 10,
    combat: 8,
    race: 'HUMAN',
    rarity: 'COMMON',
    imageUrl: 'characters/fake-straw-hats/mounblutain.webp',
    description: "Le tireur le moins précis de Grand Line, on raconte qu'il est capable de rater une cible à bout portant",
  },
  // TODO: Ajouter drip, chocolat nora gitsune
];
