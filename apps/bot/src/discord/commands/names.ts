import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@one-piece/db';

import type { Command } from '../types.js';

type CommandTriggerName = {
  language: SupportedLanguage;
  name: string;
};

export function getCommandDisplayName(command: Command, language: SupportedLanguage): string {
  return command.name[language];
}

export function getCommandTriggerNameEntries(command: Command): Array<CommandTriggerName> {
  return SUPPORTED_LANGUAGES.flatMap((language) => [
    { language, name: command.name[language] },
    ...(command.alias ? [{ language, name: command.alias[language] }] : []),
  ]);
}

export function getCommandTriggerNames(command: Command): Array<string> {
  return Array.from(new Set(getCommandTriggerNameEntries(command).map((entry) => entry.name)));
}
