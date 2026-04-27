import { ValidationError } from '../errors.js';

export function parseIntegerArg(raw: string | undefined): number {
  const value = Number(raw);

  if (!Number.isInteger(value)) {
    throw new ValidationError(`"${raw}" n'est pas un nombre entier !`);
  }

  return value;
}
