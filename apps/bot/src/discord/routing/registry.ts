import type { SupportedLanguage } from '@one-piece/db';
import uniq from 'lodash/uniq.js';

import { ValidationError } from '../errors.js';
import type { Command } from '../types.js';
import { getCommandNameEntries } from '../utils/index.js';

type CommandMatch = {
  command: Command;
  language: SupportedLanguage;
};

type CommandRegistry = Map<string, Array<CommandMatch>>;

let commandRegistry: CommandRegistry | undefined;

export function buildCommandRegistry(commands: Array<Command>): void {
  const registry: CommandRegistry = new Map();

  for (const command of commands) {
    for (const entry of getCommandNameEntries(command)) {
      const key = entry.name.toLowerCase();
      const matches = registry.get(key) ?? [];

      if (matches.some((match) => match.command === command && match.language === entry.language)) continue;

      const duplicate = matches.find((match) => match.language === entry.language);
      if (duplicate) throw new Error(`Doublon dans le registre: "${key}" pour la langue "${entry.language}"`);

      matches.push({ command, language: entry.language });
      registry.set(key, matches);
    }
  }

  commandRegistry = registry;
}

export function resolveCommand(rawName: string, language: SupportedLanguage): Command | undefined {
  if (!commandRegistry) throw new Error("Le registre des commandes n'est pas initialisé.");

  const matches = commandRegistry.get(rawName.toLowerCase());
  if (!matches) return undefined;

  const matchesForLanguage = matches.filter((match) => match.language === language);
  const languageCommands = uniq(matchesForLanguage.map((match) => match.command));
  if (languageCommands.length === 1) return languageCommands[0];

  const commands = uniq(matches.map((match) => match.command));
  if (commands.length === 1) return commands[0];

  throw new ValidationError(buildAmbiguousCommandMessage(rawName, commands));
}

function buildAmbiguousCommandMessage(rawName: string, commands: Array<Command>): string {
  const commandList = commands.map((command) => `- ${formatCommandNames(command)}`).join('\n');
  return [`La commande \`${rawName}\` est ambiguë. Commandes possibles :`, commandList].join('\n');
}

function formatCommandNames(command: Command): string {
  return uniq(Object.values(command.names)).join(' / ');
}
