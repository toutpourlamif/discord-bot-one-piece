import type { Interaction } from 'discord.js';

import { infoButtonHandlers } from '../domains/_info/index.js';
import { characterButtonHandlers } from '../domains/character/interactions/index.js';
import { playerButtonHandlers } from '../domains/player/index.js';
import { resourceButtonHandlers } from '../domains/resource/index.js';
import { shipButtonHandlers } from '../domains/ship/index.js';
import { buildRegistryWithUniqueNames } from '../shared/build-registry.js';

import { CUSTOM_ID_SEPARATOR } from './constants.js';
import { NotFoundError } from './errors.js';
import type { ButtonHandler } from './types.js';

const allButtonHandlers: Array<ButtonHandler> = [
  ...infoButtonHandlers,
  ...playerButtonHandlers,
  ...shipButtonHandlers,
  ...resourceButtonHandlers,
  ...characterButtonHandlers,
];
const buttonRegistry = buildRegistryWithUniqueNames(allButtonHandlers, (h) => h.name);

/** Dispatche une interaction vers le bon handler. Voir `docs/discord.md`. */
export async function routeInteraction(interaction: Interaction): Promise<void> {
  if (!interaction.isButton()) return;

  const [name, ...args] = interaction.customId.split(CUSTOM_ID_SEPARATOR);
  if (!name) throw new Error(`nom pas trouvé: ${interaction.customId}`);

  const handler = buttonRegistry.get(name);
  if (!handler) return;

  try {
    await handler.handle(interaction, args);
  } catch (error) {
    if (error instanceof NotFoundError) {
      console.warn(error);
      await interaction.reply({ content: error.message, ephemeral: true });
      return;
    }

    console.error(error);
    await interaction.reply({ content: 'Une erreur est survenue.', ephemeral: true });
  }
}
