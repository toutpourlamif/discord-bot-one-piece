import { ValidationError } from '../errors.js';

export function parseStringArg(raw: string | undefined, message = 'Argument introuvable.'): string {
  if (!raw) {
    throw new ValidationError(message);
  }

  return raw;
}
