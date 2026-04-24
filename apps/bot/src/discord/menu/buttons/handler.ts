import type { ButtonInteraction } from 'discord.js';

import { CUSTOM_ID_SEPARATOR } from '../../constants.js';
import type { ButtonHandler } from '../../types.js';
import { buildMenuView } from '../views/index.js';
import { type MenuViewKey } from '../views/registry.js';

async function handle(interaction: ButtonInteraction): Promise<void> {
  await interaction.deferUpdate();
  const [, viewKey, playerIdStr] = interaction.customId.split(CUSTOM_ID_SEPARATOR);
  const playerId = Number(playerIdStr);
  if (!viewKey || !Number.isInteger(playerId)) {
    throw new Error(`customId menu malformé: ${interaction.customId}`);
  }
  const view = await buildMenuView(viewKey as MenuViewKey, playerId);
  await interaction.editReply(view);
}

export const menuButtonHandler: ButtonHandler = {
  customIdPrefix: `menu${CUSTOM_ID_SEPARATOR}`,
  handle,
};
