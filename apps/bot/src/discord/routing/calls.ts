import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@one-piece/db';
import uniq from 'lodash/uniq.js';

import type { Command } from '../types.js';

type CommandCall = {
  language: SupportedLanguage;
  name: string;
};

export function getCommandDisplayName(command: Command, language: SupportedLanguage): string {
  return command.name[language];
}

export function getCommandCalls(command: Command): Array<CommandCall> {
  return SUPPORTED_LANGUAGES.flatMap((language) => [
    { language, name: command.name[language] },
    ...(command.aliases ? [{ language, name: command.aliases[language] }] : []),
  ]);
}

export function getCommandCallNames(command: Command): Array<string> {
  return uniq(getCommandCalls(command).map((call) => call.name));
}
