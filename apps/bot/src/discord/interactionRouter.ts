import type { Interaction } from 'discord.js';

import { devilFruitButtonHandlers } from '../domains/devil_fruit/index.js';
import { playerButtonHandlers } from '../domains/player/index.js';
import { resourceButtonHandlers } from '../domains/resource/index.js';
import { shipButtonHandlers } from '../domains/ship/index.js';
import { buildRegistryWithUniqueNames } from '../shared/build-registry.js';

import { CUSTOM_ID_SEPARATOR } from './constants.js';
import type { ButtonHandler } from './types.js';

const allButtonHandlers: Array<ButtonHandler> = [
  ...devilFruitButtonHandlers,
  ...playerButtonHandlers,
  ...shipButtonHandlers,
  ...resourceButtonHandlers,
];
const buttonRegistry = buildRegistryWithUniqueNames(allButtonHandlers, (h) => h.name);

/** Dispatche une interaction vers le bon handler. Voir `docs/discord.md`. */
export async function routeInteraction(interaction: Interaction): Promise<void> {
  if (!interaction.isButton()) return;

  const [name, ...args] = interaction.customId.split(CUSTOM_ID_SEPARATOR);
  if (!name) throw new Error(`nom pas trouvé: ${interaction.customId}`);

  const handler = buttonRegistry.get(name);
  if (!handler) return;

  await handler.handle(interaction, args);
}
