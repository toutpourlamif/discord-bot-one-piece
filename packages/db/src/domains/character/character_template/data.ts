import { ALABASTA_DATA } from './data/alabasta.js';
import { ARLONG_PARK_DATA } from './data/arlong-park.js';
import { BARATIE_DATA } from './data/baratie.js';
import { DAWN_DATA } from './data/dawn.js';
import { JAYA_DATA } from './data/jaya.js';
import { LOGUETOWN_DATA } from './data/loguetown.js';
import { SABAODY_DATA } from './data/sabaody.js';
import { SYRUP_VILLAGE_DATA } from './data/syrup-village.js';
import type { CharacterTemplateSeed } from './data/types.js';
import { YOTSUBA_DATA } from './data/yotsuba.js';

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
  ...DAWN_DATA,
  ...ALABASTA_DATA,
  ...BARATIE_DATA,
  ...JAYA_DATA,
  ...SABAODY_DATA,
  ...YOTSUBA_DATA,
  ...LOGUETOWN_DATA,
  ...ARLONG_PARK_DATA,
  ...SYRUP_VILLAGE_DATA,
];
