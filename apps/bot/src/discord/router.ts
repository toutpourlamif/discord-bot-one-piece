import type { Message } from 'discord.js';

import { devCommands } from '../domains/_dev/index.js';
import { infoCommands } from '../domains/_info/index.js';
import { crewCommands } from '../domains/crew/index.js';
import { autoSyncBeforeAction, eventCommands } from '../domains/event/index.js';
import { fishingCommands } from '../domains/fishing/index.js';
import { guildCommands, requireGuildId } from '../domains/guild/index.js';
import * as guildRepository from '../domains/guild/repository.js';
import { interceptOnboardingCommand, onboardingCommands } from '../domains/onboarding/index.js';
import { playerCommands } from '../domains/player/index.js';
import { findOrCreatePlayer } from '../domains/player/service.js';
import { resourceCommands } from '../domains/resource/index.js';
import { shipCommands } from '../domains/ship/commands/index.js';
import { tavernCommands } from '../domains/tavern/index.js';

import { AppError } from './errors.js';
import { buildCommandRegistry, resolveCommand } from './routing/registry.js';
import { buildOpEmbed } from './utils/index.js';

const allCommands = [
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
buildCommandRegistry(allCommands);

/** Dispatche un message vers le bon handler de commande. Voir `docs/discord.md`. */
export async function routeMessage(message: Message): Promise<void> {
  if (message.author.bot) return;

  try {
    const guildId = requireGuildId(message.guildId);
    const guild = await guildRepository.findOrCreate(guildId, message.guild!.name);

    const content = message.content.trim();
    if (!content.startsWith(guild.prefix)) return;

    const [rawName, ...args] = content.slice(guild.prefix.length).trim().split(/\s+/);
    if (!rawName) return;

    const command = resolveCommand(rawName, guild.language);
    if (!command) return;

    const { player } = await findOrCreatePlayer(message.author.id, message.author.username, guild.id);

    if (command.requiresOpAdmin) {
      // assertPlayerIsAdmin(player); TODO: réactiver en prod
    }

    const intercepted = await interceptOnboardingCommand({ ctx: { message, args, player, guild }, command });
    if (intercepted) return;

    if (command.requiresSynchronization !== false) {
      await autoSyncBeforeAction(message, player, guild);
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
