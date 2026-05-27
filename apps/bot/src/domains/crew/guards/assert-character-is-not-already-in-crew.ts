import { ValidationError } from '../../../discord/errors.js';

export function assertCharacterIsNotAlreadyInCrew(character: { joinedCrewAt: Date | null }): void {
  if (character.joinedCrewAt !== null) {
    throw new ValidationError('Ce personnage est déjà dans ton équipage.');
  }
}
