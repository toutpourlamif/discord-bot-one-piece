import { type SupportedLanguage } from './constants.js';
import * as guildRepository from './repository.js';

// TODO: brancher la lecture de guild.language sur les renderers (i18n) — issue à venir
export async function setGuildLanguage(guildId: string, language: SupportedLanguage) {
  await guildRepository.updateLanguage(guildId, language);
}
