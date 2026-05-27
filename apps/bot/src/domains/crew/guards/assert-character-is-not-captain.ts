import { ValidationError } from '../../../discord/errors.js';

export function assertCharacterIsNotCaptain(character: { isCaptain: boolean }): void {
  if (character.isCaptain) {
    throw new ValidationError("Réassigne le capitaine d'abord avant de débarquer ce personnage.");
  }
}
