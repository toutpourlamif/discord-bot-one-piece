import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@one-piece/db';

import { ServerOnlyError } from './errors.js';

export function requireGuildId(guildId: string | null): string {
  if (!guildId) throw new ServerOnlyError();
  return guildId;
}

export function isSupportedLanguage(value: string): value is SupportedLanguage {
  return (SUPPORTED_LANGUAGES as ReadonlyArray<string>).includes(value);
}
