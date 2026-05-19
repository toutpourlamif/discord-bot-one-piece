import { type SupportedLanguage } from '@one-piece/db';

import * as guildRepository from './repository.js';

// TODO: brancher la lecture de guild.language sur les renderers (i18n) — issue à venir
export async function setGuildLanguage(guildId: string, language: SupportedLanguage): Promise<void> {
  await guildRepository.updateLanguage(guildId, language);
}
