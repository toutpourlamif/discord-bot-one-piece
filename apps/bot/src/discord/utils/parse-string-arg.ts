import { NotFoundError } from '../errors.js';

export function parseStringArg(raw: string | undefined, message = 'Argument introuvable.'): string {
  if (!raw) {
    throw new NotFoundError(message);
  }

  return raw;
}
