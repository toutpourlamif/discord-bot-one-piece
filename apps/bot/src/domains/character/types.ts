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
  devilFruit: DevilFruitTemplate | null;
  joinedCrewAt: Date | null;
  isCaptain: boolean;
  captainCombatMultiplier: number;
  captainHpMultiplier: number;
  captainBerryGainMultiplier: number;
  captainKarmaMultiplier: number;
  captainMoraleMultiplier: number;
};

export type CharacterTemplateWithDevilFruit = CharacterTemplate & {
  devilFruit: DevilFruitTemplate | null;
};
