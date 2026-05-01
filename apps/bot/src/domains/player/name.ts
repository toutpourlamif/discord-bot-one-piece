import { MAX_CHARACTER_NAME_LENGTH } from '@one-piece/db';

export class PlayerNameValidationError extends Error {}

export function assertNameNotEmpty(name: string) {
  if (name.length === 0) {
    throw new PlayerNameValidationError('Tu dois donner un nom.');
  }
}

export function assertNameWithinMaxLength(name: string) {
  if (name.length > MAX_CHARACTER_NAME_LENGTH) {
    throw new PlayerNameValidationError(`Ton nom ne peut pas dépasser ${MAX_CHARACTER_NAME_LENGTH} caractères.`);
  }
}
