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
  return uniq(getAllKeywordsOfCommand(command).map((keyword) => keyword.value));
}

/** Tous les mots déclencheurs d'une commande (nom puis alias, pour chaque langue), avec leur langue.
 * Exemple pour `ship` : [{ language: 'fr', value: 'navire' }, { language: 'fr', value: 'bateau' }, { language: 'en', value: 'ship' }, { language: 'en', value: 'boat' }]
 */
export function getAllKeywordsOfCommand(command: Command): Array<CommandKeyword> {
  const keywords: Array<CommandKeyword> = [];

  for (const language of SUPPORTED_LANGUAGES) {
    const name = command.names[language];
    const aliases = command.aliases?.[language] ?? [];

    keywords.push({ language, value: name });
    for (const alias of aliases) keywords.push({ language, value: alias });
  }

  return keywords;
}
