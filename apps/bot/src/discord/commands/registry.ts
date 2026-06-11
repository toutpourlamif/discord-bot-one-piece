import type { SupportedLanguage } from '@one-piece/db';

import type { Command } from '../types.js';

import { getCommandTriggerNameEntries } from './names.js';

type CommandMatch = {
  command: Command;
  language: SupportedLanguage;
};

type CommandRegistry = Map<string, Array<CommandMatch>>;

export function buildCommandRegistry(commands: Array<Command>): CommandRegistry {
  const registry: CommandRegistry = new Map();

  for (const command of commands) {
    for (const trigger of getCommandTriggerNameEntries(command)) {
      const key = trigger.name.toLowerCase();
      const matches = registry.get(key) ?? [];

      if (matches.some((match) => match.command === command && match.language === trigger.language)) continue;

      const duplicate = matches.find((match) => match.language === trigger.language);
      if (duplicate) throw new Error(`Doublon dans le registre: "${key}" pour la langue "${trigger.language}"`);

      matches.push({ command, language: trigger.language });
      registry.set(key, matches);
    }
  }

  return registry;
}

export function resolveCommand(registry: CommandRegistry, rawName: string, language: SupportedLanguage): Command | undefined {
  const matches = registry.get(rawName.toLowerCase());
  if (!matches) return undefined;

  const languageCommands = uniqueCommands(matches.filter((match) => match.language === language).map((match) => match.command));
  if (languageCommands.length === 1) return languageCommands[0];

  const commands = uniqueCommands(matches.map((match) => match.command));
  if (commands.length === 1) return commands[0];

  throw new Error(`Commande ambiguë: "${rawName}"`);
}

function uniqueCommands(commands: Array<Command>): Array<Command> {
  return Array.from(new Set(commands));
}
