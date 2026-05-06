import { MAX_CHARACTER_NAME_LENGTH } from '@one-piece/db';

import { ValidationError } from '../../../discord/errors.js';

export function assertNameWithinMaxLength(name: string) {
  if (name.length > MAX_CHARACTER_NAME_LENGTH) {
    throw new ValidationError(`Ton nom ne peut pas dépasser ${MAX_CHARACTER_NAME_LENGTH} caractères.`);
  }
}
