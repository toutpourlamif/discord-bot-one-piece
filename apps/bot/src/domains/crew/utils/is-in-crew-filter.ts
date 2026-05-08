import type { CharacterRow } from '../../character/types.js';

export function isInCrewFilter(character: CharacterRow): boolean {
  return character.joinedCrewAt !== null;
}
