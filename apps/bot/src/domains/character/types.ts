/** Row (character_instance + character_template) consommé par la vue Personnages. */
export type CharacterRow = {
  instanceId: number;
  name: string;
  hp: number;
  combat: number;
  joinedCrewAt: Date | null;
  isCaptain: boolean;
};
