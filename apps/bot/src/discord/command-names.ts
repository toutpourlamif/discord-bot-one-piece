import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@one-piece/db';
import uniq from 'lodash/uniq.js';

import type { Command } from './types.js';

type CommandKeyword = {
  language: SupportedLanguage;
  value: string;
};

/** Nom affichable d'une commande dans une langue donnée (utilisable pour footer, rappels d'onboarding, …). */
export function getCommandDisplayNameByLanguage(command: Command, language: SupportedLanguage): string {
  return command.names[language];
}

/** Tous les mots qui déclenchent une commande (noms + alias, toutes langues), dédupliqués. */
export function getCommandKeywords(command: Command): Array<string> {
  return uniq(listCommandKeywords(command).map((keyword) => keyword.value));
}

/** Mots déclencheurs avec leur langue, pour construire le registre : pour chaque langue, le nom puis ses alias. */
export function listCommandKeywords(command: Command): Array<CommandKeyword> {
  const keywords: Array<CommandKeyword> = [];

  for (const language of SUPPORTED_LANGUAGES) {
    const name = command.names[language];
    const aliases = command.aliases?.[language] ?? [];

    keywords.push({ language, value: name });
    for (const alias of aliases) keywords.push({ language, value: alias });
  }

  return keywords;
}
