import type { Message } from 'discord.js';

import { devCommands } from '../domains/_dev/index.js';
import { infoCommands } from '../domains/_info/index.js';
import { characterCommands } from '../domains/character/commands/index.js';
import { fishingCommands } from '../domains/fishing/index.js';
import { playerCommands } from '../domains/player/index.js';
import { resourceCommands } from '../domains/resource/index.js';
import { shipCommands } from '../domains/ship/commands/index.js';
import { buildRegistryWithUniqueNames } from '../shared/build-registry.js';

import { AppError } from './errors.js';
import { buildOpEmbed } from './utils/build-op-embed.js';

const allCommands = [
  ...playerCommands,
  ...infoCommands,
  ...devCommands,
  ...shipCommands,
  ...resourceCommands,
  ...fishingCommands,
  ...characterCommands,
];
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
    if (error instanceof AppError) {
      console[error.severity](error);
      await message.reply({ embeds: [buildOpEmbed(error.severity).setDescription(error.userMessage)] });
    } else {
      console.error(error);
      await message.reply({ embeds: [buildOpEmbed('error').setDescription('Une erreur est survenue.')] });
    }
  }
}
