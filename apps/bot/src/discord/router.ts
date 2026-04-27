import type { Message } from 'discord.js';

import { devCommands } from '../domains/_dev/index.js';
import { infoCommands } from '../domains/_info/index.js';
import { characterCommands } from '../domains/character/commands/index.js';
import { playerCommands } from '../domains/player/index.js';
import { resourceCommands } from '../domains/resource/index.js';
import { shipCommands } from '../domains/ship/commands/index.js';
import { buildRegistryWithUniqueNames } from '../shared/build-registry.js';

import { NotFoundError, ValidationError } from './errors.js';
import { buildOpEmbed } from './utils/build-op-embed.js';

const allCommands = [...playerCommands, ...infoCommands, ...devCommands, ...shipCommands, ...resourceCommands, ...characterCommands];
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
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      console.warn(error);
      await message.reply({ embeds: [buildOpEmbed('warn').setDescription(error.message)] });
    } else {
      console.error(error);
      await message.reply({ embeds: [buildOpEmbed('error').setDescription('Une erreur est survenue.')] });
    }
  }
}
