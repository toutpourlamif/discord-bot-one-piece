import type { Guild } from '@one-piece/db';
import type { Message } from 'discord.js';

import { autoSyncBeforeAction } from '../domains/event/index.js';
import { requireGuildId } from '../domains/guild/index.js';
import * as guildRepository from '../domains/guild/repository.js';
import { interceptOnboardingCommand } from '../domains/onboarding/index.js';
import { findOrCreatePlayer } from '../domains/player/service.js';

import { resolveCommand } from './command-registry.js';
import { AppError } from './errors.js';
import { buildOpEmbed } from './utils/index.js';

/** Dispatche un message vers le bon handler de commande. Voir `docs/discord.md`. */
export async function routeMessage(message: Message): Promise<void> {
  if (message.author.bot) return;

  let guild: Guild;
  try {
    const guildId = requireGuildId(message.guildId);
    guild = await guildRepository.findOrCreate(guildId, message.guild!.name);
  } catch (error) {
    console.error(error);
    return;
  }

  const content = message.content.trim();
  if (!content.startsWith(guild.prefix)) return;

  const [rawName, ...args] = content.slice(guild.prefix.length).trim().split(/\s+/);
  if (!rawName) return;

  const command = resolveCommand(rawName, guild.language);
  if (!command) return;

  try {
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
