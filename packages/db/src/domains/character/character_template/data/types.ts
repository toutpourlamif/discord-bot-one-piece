import type { DevilFruitName } from '../../../devil_fruit/devil_fruit_template/data.js';
import type { CharacterTemplateInsert } from '../schema.js';

export type CharacterTemplateSeed = Omit<CharacterTemplateInsert, 'devilFruitTemplateId'> & {
  devilFruitName?: DevilFruitName;
};
