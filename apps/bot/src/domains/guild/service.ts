import { ValidationError } from '../../discord/errors.js';

import { SUPPORTED_LANGUAGES, type SupportedLanguage } from './constants.js';
import * as guildRepository from './repository.js';

// TODO: brancher la lecture de guild.language sur les renderers (i18n) — issue à venir
export async function setGuildLanguage(guildId: string, rawLanguage: string) {
  const foundLanguage = SUPPORTED_LANGUAGES.includes(rawLanguage as SupportedLanguage);
  if (!foundLanguage) {
    throw new ValidationError(`Langage ${rawLanguage} non supporté. (${SUPPORTED_LANGUAGES.join(', ')})`);
  }

  await guildRepository.updateLanguage(guildId, rawLanguage);
}
