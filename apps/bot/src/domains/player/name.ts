import { MAX_PLAYER_NAME_LENGTH } from './constants.js';

export class PlayerNameValidationError extends Error {}

export function assertNameNotEmpty(name: string) {
  if (name.length === 0) {
    throw new PlayerNameValidationError('Tu dois donner un nom.');
  }
}

export function assertNameWithinMaxLength(name: string) {
  if (name.length > MAX_PLAYER_NAME_LENGTH) {
    throw new PlayerNameValidationError(`Ton nom ne peut pas dépasser ${MAX_PLAYER_NAME_LENGTH} caractères.`);
  }
}
