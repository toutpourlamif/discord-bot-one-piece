import type { CharacterInstance, CharacterTemplate, DevilFruitTemplate } from '@one-piece/db';

/** Personnage enrôlé : instance + champs d'affichage du template + fruit effectif (coalesce template/instance). */
export type Character = Pick<CharacterInstance, 'joinedCrewAt' | 'isCaptain'> &
  Pick<
    CharacterTemplate,
    | 'name'
    | 'imageUrl'
    | 'hp'
    | 'combat'
    | 'captainCombatMultiplier'
    | 'captainHpMultiplier'
    | 'captainBerryGainMultiplier'
    | 'captainKarmaMultiplier'
    | 'captainMoraleMultiplier'
  > & {
    instanceId: number;
    devilFruit: DevilFruitTemplate | null;
  };

export type CharacterTemplateWithDevilFruit = CharacterTemplate & {
  devilFruit: DevilFruitTemplate | null;
};
