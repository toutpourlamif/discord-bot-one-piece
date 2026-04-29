import type { CharacterTemplate, DevilFruitTemplate } from '@one-piece/db';

/** Row (character_instance + character_template) consommé par la vue Personnages. */
export type CharacterRow = {
  instanceId: number;
  name: string;
  nickname: string | null;
  hp: number;
  combat: number;
  joinedCrewAt: Date | null;
  isCaptain: boolean;
};

export type CharacterTemplateInfo = CharacterTemplate & {
  devilFruitName: string | null;
  devilFruitTypes: DevilFruitTemplate['types'] | null;
};
