import { PLAYER_AS_CHARACTER_TEMPLATE_NAME } from './constants.js';
import { FAKE_STRAW_HATS_DATA } from './data/fake-straw-hats.js';
import { STRAW_HATS_DATA } from './data/straw-hats.js';
import type { CharacterTemplateSeed } from './data/types.js';

// TODO: supprimer/modifier en prod
export const CHARACTER_TEMPLATES_DATA: Array<CharacterTemplateSeed> = [
  {
    name: PLAYER_AS_CHARACTER_TEMPLATE_NAME,
    race: 'HUMAN',
    hp: 10,
    combat: 10,
    imageUrl: null,
  },
  {
    name: 'Monkey D. Luffy',
    hp: 10,
    combat: 10,
    race: 'HUMAN',
    imageUrl: null,
    devilFruitName: 'Gomu Gomu no Mi',
    description: 'Homme ÉLastique qui adore le bezelouf',
  },
  {
    name: 'Roronoa Zoro',
    hp: 10,
    combat: 10,
    race: 'HUMAN',
    imageUrl: null,
    description: 'épéiste avec des origine dz',
  },
  {
    name: 'Shanks',
    hp: 10,
    combat: 10,
    race: 'HUMAN',
    imageUrl: null,
    description: 'rouqin boosté',
  },
  // TODO: ajouter les fichiers WebP correspondants dans assets/characters avant merge.
  {
    name: 'Dracule Mihawk',
    hp: 24,
    combat: 30,
    race: 'HUMAN',
    rarity: 'LEGENDARY',
    imageUrl: 'characters/dracule-mihawk.webp',
    description: 'Le plus grand épéiste du monde, calme et impitoyable.',
  },
  {
    name: 'Crocodile',
    hp: 18,
    combat: 24,
    race: 'HUMAN',
    rarity: 'VERY_RARE',
    imageUrl: 'characters/crocodile.webp',
    description: "Ancien Grand Corsaire, stratège froid et maître d'Alabasta.",
  },
  {
    name: 'Smoker',
    hp: 16,
    combat: 20,
    race: 'HUMAN',
    rarity: 'RARE',
    imageUrl: 'characters/smoker.webp',
    description: 'Marine obstiné qui poursuit les pirates sans relâche.',
  },
  {
    name: 'Arlong',
    hp: 15,
    combat: 18,
    race: 'FISHMAN',
    rarity: 'RARE',
    imageUrl: 'characters/arlong.webp',
    description: "Capitaine homme-poisson brutal venu imposer sa loi à l'East Blue.",
  },
  {
    name: 'Don Krieg',
    hp: 13,
    combat: 15,
    race: 'HUMAN',
    rarity: 'COMMON',
    imageUrl: null,
    description: "Chef pirate de l'East Blue, dangereux surtout par son arsenal.",
  },
  ...FAKE_STRAW_HATS_DATA,
  ...STRAW_HATS_DATA,
];
