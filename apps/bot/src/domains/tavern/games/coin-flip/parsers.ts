import { ValidationError } from '../../../../discord/errors.js';
import { parseStringArg } from '../../../../discord/utils/index.js';

import type { CoinSide } from './types.js';

export function parsePositiveBet(raw: string): bigint {
  const trimmedValue = raw.trim();
  if (!/^\d+$/.test(trimmedValue)) throw new ValidationError('Mise invalide : entre un nombre entier de berries.');

  const betAmount = BigInt(trimmedValue);
  if (betAmount <= 0n) throw new ValidationError('La mise doit être supérieure à 0.');

  return betAmount;
}

/** Valide le côté choisi dans le select du modal (valeur brute renvoyée par `getStringSelectValues`). */
export function parseCoinSide(raw: string | undefined): CoinSide {
  const side = parseStringArg(raw);
  if (side !== 'heads' && side !== 'tails') throw new ValidationError(`Côté de pièce invalide : ${side}`);

  return side;
}
