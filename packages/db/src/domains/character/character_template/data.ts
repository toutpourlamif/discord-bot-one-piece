import { ARLONG_PARK_DATA } from './data/arlong-park.js';
import { FAKE_STRAW_HATS_DATA } from './data/fake-straw-hats.js';
import { LOGUETOWN_DATA } from './data/loguetown.js';
import { STRAW_HATS_DATA } from './data/straw-hats.js';
import { SYRUP_VILLAGE_DATA } from './data/syrup-village.js';
import type { CharacterTemplateSeed } from './data/types.js';
import { YOTSUBA_ISLAND_DATA } from './data/yotsuba-island.js';
function buildCharacterPath(crew: string, slug: string): string {
  return `characters/${crew}/${slug}`;
}

// TODO: supprimer/modifier en prod
// TODO: compléter les types de base quand ils sont moins évidents que la race.
export const CHARACTER_TEMPLATES_DATA: Array<CharacterTemplateSeed> = [
  {
    name: 'Monkey D. Luffy',
    hp: 10,
    combat: 10,
    race: 'HUMAN',
    skills: ['CONQUERORS_HAKI'],
    path: null,
    devilFruitName: 'Gomu Gomu no Mi',
    description: 'Homme ÉLastique qui adore le bezelouf',
    captainCombatMultiplier: 1.3,
  },
  {
    name: 'Roronoa Zoro',
    hp: 10,
    combat: 10,
    race: 'HUMAN',
    path: null,
    description: 'épéiste avec des origine dz',
  },
  {
    name: 'Shanks',
    hp: 10,
    combat: 10,
    race: 'HUMAN',
    skills: ['CONQUERORS_HAKI'],
    path: null,
    description: 'rouqin boosté',
  },
  // TODO: ajouter les fichiers WebP correspondants dans assets/characters avant merge.
  {
    name: 'Dracule Mihawk',
    hp: 24,
    combat: 30,
    race: 'HUMAN',
    rarity: 'S',
    path: 'characters/dracule-mihawk',
    description: 'Le plus grand épéiste du monde, calme et impitoyable.',
  },
  {
    name: 'Crocodile',
    hp: 18,
    combat: 24,
    race: 'HUMAN',
    rarity: 'B',
    path: 'characters/crocodile',
    description: "Ancien Grand Corsaire, stratège froid et maître d'Alabasta.",
  },
  {
    name: 'Smoker',
    hp: 16,
    combat: 20,
    race: 'HUMAN',
    rarity: 'C',
    path: 'characters/smoker',
    description: 'Marine obstiné qui poursuit les pirates sans relâche.',
  },
  {
    name: 'Don Krieg',
    hp: 13,
    combat: 15,
    race: 'HUMAN',
    rarity: 'D',
    path: null,
    description: "Chef pirate de l'East Blue, dangereux surtout par son arsenal.",
  },
  {
    name: 'Portgas D. Ace',
    hp: 22,
    combat: 26,
    race: 'HUMAN',
    rarity: 'A',
    skills: ['CONQUERORS_HAKI'],
    path: buildCharacterPath('whitebeard-pirates', 'portgas-d-ace'),
    devilFruitName: 'Mera Mera no Mi',
    description: 'Commandant de la 2e flotte de Barbe Blanche, frère de Luffy et fils du légendaire Gol D. Roger.',
  },
  {
    name: 'Marshall D. Teach',
    hp: 30,
    combat: 28,
    race: 'HUMAN',
    rarity: 'S',
    path: buildCharacterPath('blackbeard-pirates', 'marshall-d-teach'),
    devilFruitName: 'Yami Yami no Mi',
    description: 'Capitaine des Pirates de Barbe Noire, seul homme connu à porter deux fruits du démon.',
  },
  {
    name: 'Eustass Kid',
    hp: 24,
    combat: 26,
    race: 'HUMAN',
    rarity: 'A',
    skills: ['CONQUERORS_HAKI'],
    path: buildCharacterPath('kid-pirates', 'eustass-kid'),
    devilFruitName: 'Jiki Jiki no Mi',
    description: 'Capitaine des Pirates de Kid, Supernova brutal qui plie le métal à sa volonté.',
  },
  {
    name: 'Basil Hawkins',
    hp: 18,
    combat: 23,
    race: 'HUMAN',
    rarity: 'B',
    path: buildCharacterPath('beasts-pirates', 'basil-hawkins'),
    description: "Le Mage, Supernova énigmatique qui lit l'avenir dans ses cartes de tarot.",
  },
  ...FAKE_STRAW_HATS_DATA,
  ...STRAW_HATS_DATA,
  ...YOTSUBA_ISLAND_DATA,
  ...LOGUETOWN_DATA,
  ...ARLONG_PARK_DATA,
  ...SYRUP_VILLAGE_DATA,
];
