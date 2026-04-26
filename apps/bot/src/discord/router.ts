import type { Message } from 'discord.js';

import { devCommands } from '../domains/_dev/index.js';
import { devilFruitCommands } from '../domains/devil_fruit/index.js';
import { playerCommands } from '../domains/player/index.js';
import { resourceCommands } from '../domains/resource/index.js';
import { shipCommands } from '../domains/ship/commands/index.js';
import { buildRegistryWithUniqueNames } from '../shared/build-registry.js';

import { NotFoundError } from './errors.js';

const allCommands = [...playerCommands, ...devilFruitCommands, ...devCommands, ...shipCommands, ...resourceCommands];
const registry = buildRegistryWithUniqueNames(allCommands, (c) => c.name.toLowerCase());

/** Dispatche un message vers le bon handler de commande. Voir `docs/discord.md`. */
export async function routeMessage(message: Message, prefix: string): Promise<void> {
  if (message.author.bot) return;

  const content = message.content.trim();
  if (!content.startsWith(prefix)) return;

  const [rawName, ...args] = content.slice(prefix.length).trim().split(/\s+/);
  if (!rawName) return;

  const command = registry.get(rawName.toLowerCase());
  if (!command) return;

  try {
    await command.handler(message, args);
  } catch (error) {
    if (error instanceof NotFoundError) {
      console.warn(error);
      await message.reply(error.message);
      return;
    }
    console.error(error);
    await message.reply('Une erreur est survenue.');
  }
}
