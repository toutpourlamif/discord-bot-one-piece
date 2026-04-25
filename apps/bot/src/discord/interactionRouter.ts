import type { Interaction } from 'discord.js';

import { devilFruitButtonHandlers } from '../domains/devil_fruit/index.js';
import { playerButtonHandlers } from '../domains/player/index.js';

import { menuButtonHandler } from './menu/index.js';

const allButtonHandlers = [...devilFruitButtonHandlers, ...playerButtonHandlers, menuButtonHandler];

/** Dispatche une interaction vers le bon handler. Voir `docs/discord.md`. */
export async function routeInteraction(interaction: Interaction): Promise<void> {
  if (!interaction.isButton()) return;

  const handler = allButtonHandlers.find((handler) => interaction.customId.startsWith(handler.customIdPrefix));
  if (!handler) return;

  await handler.handle(interaction);
}
