import { history } from '@one-piece/db';
import { eq, like, or, type SQL } from 'drizzle-orm';

import { ValidationError } from '../../../discord/errors.js';

const SAFE_KIND = /^[a-zA-Z0-9.]+$/;

// Matche la kind exacte (`seagullFlyby`) ou une sous-kind dottée (`seagullFlyby.outcomeX`).
// Le whitelist en amont garantit qu'aucun méta-caractère LIKE (% ou _) ne passe.
export function buildKindMatcher(kind: string): SQL {
  if (!SAFE_KIND.test(kind)) {
    throw new ValidationError(`History kind invalide \`${kind}\` — uniquement lettres, chiffres et points sont autorisés.`);
  }
  return or(eq(history.type, kind), like(history.type, `${kind}.%`))!;
}
