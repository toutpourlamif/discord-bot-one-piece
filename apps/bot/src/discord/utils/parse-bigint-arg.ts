import { ValidationError } from '../errors.js';

export function parseBigintArg(raw: string | undefined): bigint {
  if (raw === undefined || raw === '') {
    throw new ValidationError(`"${raw}" n'est pas un nombre entier !`);
  }

  try {
    return BigInt(raw);
  } catch {
    throw new ValidationError(`"${raw}" n'est pas un nombre entier !`);
  }
}
