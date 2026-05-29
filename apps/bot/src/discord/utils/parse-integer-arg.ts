import { ValidationError } from '../errors.js';

import { isValidPostgresInteger } from './valid-postgres-integer.js';
export function parseIntegerArg(raw: string | undefined): number {
  const value = Number(raw);

  if (!isValidPostgresInteger(value)) {
    throw new ValidationError(`"${raw}" n'est pas un nombre entier !`);
  }

  return value;
}
