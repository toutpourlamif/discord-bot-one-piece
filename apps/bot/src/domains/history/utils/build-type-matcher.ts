import { history } from '@one-piece/db';
import { eq, like, or, type SQL } from 'drizzle-orm';

import { ValidationError } from '../../../discord/errors.js';

const SAFE_TYPE = /^[a-zA-Z0-9.]+$/;

// Matche le type exact (`seagullFlyby`) ou un sous-type dotté (`seagullFlyby.outcomeX`).
// Le whitelist en amont garantit qu'aucun méta-caractère LIKE (% ou _) ne passe.
export function buildTypeMatcher(type: string): SQL {
  if (!SAFE_TYPE.test(type)) {
    throw new ValidationError(`History type invalide \`${type}\` — uniquement lettres, chiffres et points sont autorisés.`);
  }
  return or(eq(history.type, type), like(history.type, `${type}.%`))!;
}
