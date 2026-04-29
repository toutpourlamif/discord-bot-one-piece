import type { Interaction, InteractionReplyOptions } from 'discord.js';

import { devButtonHandlers } from '../domains/_dev/interactions/index.js';
import { infoButtonHandlers } from '../domains/_info/index.js';
import { characterButtonHandlers } from '../domains/character/interactions/index.js';
import { playerButtonHandlers } from '../domains/player/index.js';
import { resourceButtonHandlers } from '../domains/resource/index.js';
import { shipButtonHandlers } from '../domains/ship/index.js';
import { buildRegistryWithUniqueNames } from '../shared/build-registry.js';

import { CUSTOM_ID_SEPARATOR } from './constants.js';
import { AppError, ValidationError } from './errors.js';
import type { ButtonHandler } from './types.js';
import { buildOpEmbed } from './utils/index.js';

const allButtonHandlers: Array<ButtonHandler> = [
  ...infoButtonHandlers,
  ...playerButtonHandlers,
  ...shipButtonHandlers,
  ...resourceButtonHandlers,
  ...characterButtonHandlers,
  ...devButtonHandlers,
];
const buttonRegistry = buildRegistryWithUniqueNames(allButtonHandlers, (h) => h.name);

/** Dispatche une interaction vers le bon handler. Voir `docs/discord.md`. */
export async function routeInteraction(interaction: Interaction): Promise<void> {
  if (!interaction.isButton()) return;

  try {
    const [name, ...args] = interaction.customId.split(CUSTOM_ID_SEPARATOR);
    if (!name) throw new ValidationError(`nom pas trouvé: ${interaction.customId}`);

    const handler = buttonRegistry.get(name);
    if (!handler) return;

    await handler.handle(interaction, args);
  } catch (error) {
    if (error instanceof AppError) {
      console[error.severity](error);
      await replyWithEphemeralError(interaction, {
        embeds: [buildOpEmbed(error.severity).setDescription(error.userMessage)],
      });
    } else {
      console.error(error);
      await replyWithEphemeralError(interaction, {
        embeds: [buildOpEmbed('error').setDescription('Une erreur est survenue.')],
      });
    }
  }
}

async function replyWithEphemeralError(interaction: Interaction, options: InteractionReplyOptions): Promise<void> {
  if (!interaction.isRepliable()) return;

  if (interaction.deferred || interaction.replied) {
    await interaction.followUp({ ...options, ephemeral: true });
    return;
  }

  await interaction.reply({ ...options, ephemeral: true });
}
