import type { ButtonInteraction } from 'discord.js';

import type { ButtonHandler } from '../../../discord/types.js';
import { SHIP_BUTTON_NAME } from '../constants.js';
import { buildShipView } from '../ship-view.js';

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const playerId = Number(args[0]);
  // TODO: AJOUTER UN util qui valide les player id
  if (!Number.isInteger(playerId)) {
    throw new Error(`arguments invalides dans ship button: ${interaction.customId}`);
  }
  await interaction.deferUpdate();
  await interaction.editReply(await buildShipView(playerId));
}

export const shipButtonHandler: ButtonHandler = {
  name: SHIP_BUTTON_NAME,
  handle,
};
