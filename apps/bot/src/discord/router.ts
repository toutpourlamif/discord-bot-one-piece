import type { Message } from 'discord.js';

import { devCommands } from '../domains/_dev/index.js';
import { devilFruitCommands } from '../domains/devil_fruit/index.js';
import { playerCommands } from '../domains/player/index.js';
import type { Command } from '../shared/command.js';

const allCommands = [...playerCommands, ...devilFruitCommands, ...devCommands];
const registry = new Map<string, Command>(allCommands.map((c) => [c.name, c]));

/** Dispatche un message vers le bon handler de commande. Voir `docs/discord.md`. */
export async function routeMessage(message: Message, prefix: string): Promise<void> {
  if (message.author.bot) return;

  const content = message.content.trim();
  if (!content.startsWith(prefix)) return;

  const [rawName, ...args] = content.slice(prefix.length).trim().split(/\s+/);
  if (!rawName) return;

  const command = registry.get(rawName.toLowerCase());
  if (!command) return;

  await command.handler(message, args);
}
