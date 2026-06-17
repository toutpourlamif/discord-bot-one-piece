import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@one-piece/db';
import uniq from 'lodash/uniq.js';

import { devCommands } from '../domains/_dev/index.js';
import { infoCommands } from '../domains/_info/index.js';
import { crewCommands } from '../domains/crew/index.js';
import { eventCommands } from '../domains/event/index.js';
import { fishingCommands } from '../domains/fishing/index.js';
import { guildCommands } from '../domains/guild/index.js';
import { onboardingCommands } from '../domains/onboarding/index.js';
import { playerCommands } from '../domains/player/index.js';
import { resourceCommands } from '../domains/resource/index.js';
import { shipCommands } from '../domains/ship/commands/index.js';
import { tavernCommands } from '../domains/tavern/index.js';

import { ValidationError } from './errors.js';
import type { Command } from './types.js';

const allCommands: Array<Command> = [
  ...playerCommands,
  ...infoCommands,
  ...devCommands,
  ...shipCommands,
  ...resourceCommands,
  ...fishingCommands,
  ...crewCommands,
  ...guildCommands,
  ...eventCommands,
  ...onboardingCommands,
  ...tavernCommands,
];

const registry = buildRegistry(allCommands);

/** Résout le mot saisi vers une commande, en privilégiant la langue de la guild. */
export function resolveCommand(rawName: string, language: SupportedLanguage): Command | undefined {
  const matches = registry.get(rawName.toLowerCase());
  if (!matches) return undefined;

  const inGuildLanguage = matches.filter((match) => match.language === language);
  if (inGuildLanguage.length === 1) return inGuildLanguage[0]!.command;

  // Fallback : le mot n'existe pas dans la langue de la guild mais bien dans une autre.
  const candidates = uniq(matches.map((match) => match.command));
  if (candidates.length === 1) return candidates[0];

  throw new ValidationError(buildAmbiguousCommandMessage(rawName, candidates));
}

/** Nom affichable d'une commande dans une langue donnée (footer, rappels d'onboarding, …). */
export function getCommandDisplayName(command: Command, language: SupportedLanguage): string {
  return command.names[language];
}

/** Tous les mots qui déclenchent une commande (noms + alias, toutes langues), dédupliqués. */
export function getCommandKeywords(command: Command): Array<string> {
  return uniq(listKeywords(command).map((keyword) => keyword.value));
}

type CommandMatch = {
  command: Command;
  language: SupportedLanguage;
};

type CommandKeyword = {
  language: SupportedLanguage;
  value: string;
};

function buildRegistry(commands: Array<Command>): Map<string, Array<CommandMatch>> {
  const registry = new Map<string, Array<CommandMatch>>();

  for (const command of commands) {
    for (const keyword of listKeywords(command)) {
      const key = keyword.value.toLowerCase();
      const matches = registry.get(key) ?? [];

      const collision = matches.find((match) => match.language === keyword.language);
      if (collision && collision.command !== command)
        throw new Error(`Doublon dans le registre : "${key}" pour la langue "${keyword.language}"`);
      if (collision) continue;

      matches.push({ command, language: keyword.language });
      registry.set(key, matches);
    }
  }

  return registry;
}

function listKeywords(command: Command): Array<CommandKeyword> {
  return SUPPORTED_LANGUAGES.flatMap((language) => [
    { language, value: command.names[language] },
    ...(command.aliases?.[language] ?? []).map((value) => ({ language, value })),
  ]);
}

function buildAmbiguousCommandMessage(rawName: string, commands: Array<Command>): string {
  const list = commands.map((command) => `- ${uniq(Object.values(command.names)).join(' / ')}`).join('\n');
  return [`La commande \`${rawName}\` est ambiguë. Commandes possibles :`, list].join('\n');
}
