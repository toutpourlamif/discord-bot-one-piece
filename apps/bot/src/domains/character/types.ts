import type { CharacterTemplate, DevilFruitTemplate } from '@one-piece/db';

// TODO: RENOMMER EN Character tout court et ajouter le type devil fruit et PICK depuis les schémas db
/** Row (character_instance + character_template) utilisée par les vues métier. */
export type CharacterRow = {
  instanceId: number;
  name: string;
  nickname: string | null;
  imageUrl: string | null;
  hp: number;
  combat: number;
  joinedCrewAt: Date | null;
  isCaptain: boolean;
};

export type CharacterTemplateInfo = CharacterTemplate & {
  devilFruitName: string | null;
  devilFruitTypes: DevilFruitTemplate['types'] | null;
};
