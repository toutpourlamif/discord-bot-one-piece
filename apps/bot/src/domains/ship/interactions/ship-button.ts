import type { ButtonInteraction } from 'discord.js';

import type { ButtonHandler } from '../../../discord/types.js';
import { assertInteractorIsTheOwner, parseIntegerArg, parseOwnerDiscordId } from '../../../discord/utils/index.js';
import { SHIP_BUTTON_NAME } from '../constants.js';
import { buildShipView } from '../views/index.js';

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const ownerDiscordId = parseOwnerDiscordId(args[0]);
  assertInteractorIsTheOwner(interaction, ownerDiscordId);
  const playerId = parseIntegerArg(args[1]);

  await interaction.deferUpdate();
  await interaction.editReply(await buildShipView(playerId, ownerDiscordId));
}

export const shipButtonHandler: ButtonHandler = {
  name: SHIP_BUTTON_NAME,
  handle,
};
