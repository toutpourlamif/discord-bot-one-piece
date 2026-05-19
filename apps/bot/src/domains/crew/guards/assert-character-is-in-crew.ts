import { ValidationError } from '../../../discord/errors.js';

export function assertCharacterIsInCrew(character: { joinedCrewAt: Date | null }): void {
  if (character.joinedCrewAt === null) {
    throw new ValidationError("Ce personnage n'est pas dans ton équipage.");
  }
}
