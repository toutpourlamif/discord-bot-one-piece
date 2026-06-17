import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@one-piece/db';
import uniq from 'lodash/uniq.js';

import type { Command } from './types.js';

type CommandKeyword = {
  language: SupportedLanguage;
  value: string;
};

/** Nom affichable d'une commande dans une langue donnée (footer, rappels d'onboarding, …). */
export function getCommandDisplayName(command: Command, language: SupportedLanguage): string {
  return command.names[language];
}

/** Tous les mots qui déclenchent une commande (noms + alias, toutes langues), dédupliqués. */
export function getCommandKeywords(command: Command): Array<string> {
  return uniq(listCommandKeywords(command).map((keyword) => keyword.value));
}

/** Mots déclencheurs avec leur langue, pour construire le registre. */
export function listCommandKeywords(command: Command): Array<CommandKeyword> {
  return SUPPORTED_LANGUAGES.flatMap((language) => [
    { language, value: command.names[language] },
    ...(command.aliases?.[language] ?? []).map((value) => ({ language, value })),
  ]);
}
