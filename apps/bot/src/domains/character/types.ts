/** Row (character_instance + character_template) utilisée par les vues métier. */
export type CharacterRow = {
  instanceId: number;
  name: string;
  hp: number;
  combat: number;
  joinedCrewAt: Date | null;
  isCaptain: boolean;
};
