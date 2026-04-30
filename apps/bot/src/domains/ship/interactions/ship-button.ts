import type { ButtonInteraction } from 'discord.js';

import type { ButtonHandler } from '../../../discord/types.js';
import { assertMenuOwner, parseIntegerArg, parseMenuOwnerDiscordId } from '../../../discord/utils/index.js';
import { SHIP_BUTTON_NAME } from '../constants.js';
import { buildShipView } from '../ship-view.js';

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const ownerDiscordId = parseMenuOwnerDiscordId(args[0]);
  assertMenuOwner(interaction, ownerDiscordId);
  const playerId = parseIntegerArg(args[1]);

  await interaction.deferUpdate();
  await interaction.editReply(await buildShipView(playerId, ownerDiscordId));
}

export const shipButtonHandler: ButtonHandler = {
  name: SHIP_BUTTON_NAME,
  handle,
};
