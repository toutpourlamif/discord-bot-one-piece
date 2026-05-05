import type { Message } from 'discord.js';

import { devCommands } from '../domains/_dev/index.js';
import { infoCommands } from '../domains/_info/index.js';
import { crewCommands } from '../domains/crew/index.js';
import { fishingCommands } from '../domains/fishing/index.js';
import { ensureGuildExists } from '../domains/guild/index.js';
import { playerCommands } from '../domains/player/index.js';
import { findOrCreatePlayer } from '../domains/player/service.js';
import { resourceCommands } from '../domains/resource/index.js';
import { shipCommands } from '../domains/ship/commands/index.js';
import { buildRegistry } from '../shared/build-registry.js';

import { AppError } from './errors.js';
import { buildOpEmbed } from './utils/index.js';

const allCommands = [
  ...playerCommands,
  ...infoCommands,
  ...devCommands,
  ...shipCommands,
  ...resourceCommands,
  ...fishingCommands,
  ...crewCommands,
];
const registry = buildRegistry(allCommands, (command) =>
  Array.isArray(command.name) ? command.name.map((name) => name.toLowerCase()) : command.name.toLowerCase(),
);

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
    await ensureGuildExists(message.guildId);
    const { player } = await findOrCreatePlayer(message.author.id, message.author.username, message.guildId!);
    await command.handler({ message, args, player });
  } catch (error) {
    if (error instanceof AppError) {
      console[error.severity](error);
      await message.reply({ embeds: [buildOpEmbed(error.severity).setDescription(error.userMessage)], failIfNotExists: false });
    } else {
      console.error(error);
      await message.reply({ embeds: [buildOpEmbed('error').setDescription('Une erreur est survenue.')], failIfNotExists: false });
    }
  }
}
