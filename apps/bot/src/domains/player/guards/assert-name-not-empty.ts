import { ValidationError } from '../../../discord/errors.js';

export function assertNameNotEmpty(name: string) {
  if (name.length === 0) {
    throw new ValidationError('Tu dois donner un nom.');
  }
}
