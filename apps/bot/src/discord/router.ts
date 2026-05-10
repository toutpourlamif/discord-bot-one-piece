import type { Message } from 'discord.js';

import { devCommands } from '../domains/_dev/index.js';
import { infoCommands } from '../domains/_info/index.js';
import { crewCommands } from '../domains/crew/index.js';
import { autoSyncBeforeAction } from '../domains/event/index.js';
import { fishingCommands } from '../domains/fishing/index.js';
import { requireGuildId } from '../domains/guild/index.js';
import * as guildRepository from '../domains/guild/repository.js';
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
    const guildId = requireGuildId(message.guildId);
    const guild = await guildRepository.findOrCreate(guildId, message.guild!.name);
    const { player } = await findOrCreatePlayer(message.author.id, message.author.username, guild.id);

    if (command.requiresSynchronization !== false) {
      await autoSyncBeforeAction(message, player.id);
    }

    await command.handler({ message, args, player, guild });
  } catch (error) {
    if (error instanceof AppError) {
      console[error.severity](error);
      await message.reply({
        ...(error.userView ?? { embeds: [buildOpEmbed(error.severity).setDescription(error.userMessage)] }),
        failIfNotExists: false,
      });
    } else {
      console.error(error);
      await message.reply({ embeds: [buildOpEmbed('error').setDescription('Une erreur est survenue.')], failIfNotExists: false });
    }
  }
}
