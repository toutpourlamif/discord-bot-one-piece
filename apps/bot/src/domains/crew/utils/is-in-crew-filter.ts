import type { Character } from '../../character/types.js';

export function isInCrewFilter(character: Character): boolean {
  return character.joinedCrewAt !== null;
}
