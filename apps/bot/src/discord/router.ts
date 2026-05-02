import type { Message } from 'discord.js';

import { devCommands } from '../domains/_dev/index.js';
import { infoCommands } from '../domains/_info/index.js';
import { crewCommands } from '../domains/crew/index.js';
import { fishingCommands } from '../domains/fishing/index.js';
import { findOrCreatePlayer, playerCommands } from '../domains/player/index.js';
import { resourceCommands } from '../domains/resource/index.js';
import { shipCommands } from '../domains/ship/commands/index.js';
import { buildRegistry } from '../shared/build-registry.js';

import { AdminOnlyError, AppError } from './errors.js';
import { getSelfUser } from './utils/get-self-user.js';
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
    if (command.adminOnly === true) {
      const user = getSelfUser(message);
      const { player } = await findOrCreatePlayer(user.id, user.username);
      if (!player.isAdmin) {
        throw new AdminOnlyError();
      }
    }
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
