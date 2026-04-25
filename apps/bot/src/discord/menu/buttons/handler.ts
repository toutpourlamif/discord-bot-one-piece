import type { ButtonInteraction } from 'discord.js';

import type { ButtonHandler } from '../../types.js';
import { buildMenuView } from '../views/index.js';
import { type MenuViewKey } from '../views/registry.js';

import { MENU_BUTTON_NAME } from './constants.js';

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  await interaction.deferUpdate();
  const [viewKey, playerIdStr] = args;
  // TODO: Créer un util qui transforme un playerIdStr en NUMBER (et throw si jamais ça marche pas)
  const playerId = Number(playerIdStr);
  if (!viewKey || !Number.isInteger(playerId)) {
    throw new Error(`customId menu malformé: ${interaction.customId}`);
  }
  const view = await buildMenuView(viewKey as MenuViewKey, playerId);
  await interaction.editReply(view);
}

export const menuButtonHandler: ButtonHandler = {
  name: MENU_BUTTON_NAME,
  handle,
};
