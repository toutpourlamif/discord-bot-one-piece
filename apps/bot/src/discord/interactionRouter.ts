import type { Interaction } from 'discord.js';

import { infoButtonHandlers } from '../domains/_info/index.js';
import { characterButtonHandlers } from '../domains/character/interactions/index.js';
import { playerButtonHandlers } from '../domains/player/index.js';
import { resourceButtonHandlers } from '../domains/resource/index.js';
import { shipButtonHandlers } from '../domains/ship/index.js';
import { buildRegistryWithUniqueNames } from '../shared/build-registry.js';

import { CUSTOM_ID_SEPARATOR } from './constants.js';
import { NotFoundError, ValidationError } from './errors.js';
import type { ButtonHandler } from './types.js';
import { buildOpEmbed } from './utils/build-op-embed.js';

const allButtonHandlers: Array<ButtonHandler> = [
  ...infoButtonHandlers,
  ...playerButtonHandlers,
  ...shipButtonHandlers,
  ...resourceButtonHandlers,
  ...characterButtonHandlers,
];
const buttonRegistry = buildRegistryWithUniqueNames(allButtonHandlers, (h) => h.name);

function isUserFacingError(error: unknown): error is NotFoundError | ValidationError {
  return error instanceof NotFoundError || error instanceof ValidationError;
}

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
    switch (true) {
      case isUserFacingError(error):
        console.warn(error);
        await interaction.reply({ embeds: [buildOpEmbed('warn').setDescription(error.message)], ephemeral: true });
        break;
      default:
        console.error(error);
        await interaction.reply({ embeds: [buildOpEmbed('error').setDescription('Une erreur est survenue.')], ephemeral: true });
    }
  }
}
