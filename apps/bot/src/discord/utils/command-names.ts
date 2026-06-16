import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@one-piece/db';
import uniq from 'lodash/uniq.js';

import type { Command } from '../types.js';

type CommandNameEntry = {
  language: SupportedLanguage;
  name: string;
};

export function getCommandDisplayName(command: Command, language: SupportedLanguage): string {
  return command.names[language];
}

export function getCommandNameEntries(command: Command): Array<CommandNameEntry> {
  return SUPPORTED_LANGUAGES.flatMap((language) => [
    { language, name: command.names[language] },
    ...(command.aliases ? [{ language, name: command.aliases[language] }] : []),
  ]);
}

export function getCommandLookupNames(command: Command): Array<string> {
  return uniq(getCommandNameEntries(command).map((entry) => entry.name));
}
