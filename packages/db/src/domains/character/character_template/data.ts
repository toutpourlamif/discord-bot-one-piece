import type { DevilFruitName } from '../../devil_fruit/devil_fruit_template/data.js';

import { PLAYER_AS_CHARACTER_TEMPLATE_NAME } from './constants.js';
import type { CharacterTemplateInsert } from './schema.js';

/** Nom du template spéciale qui représente le player (voir doc) */

type CharacterTemplateSeed = Omit<CharacterTemplateInsert, 'devilFruitTemplateId'> & {
  devilFruitName?: DevilFruitName;
};

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
];
