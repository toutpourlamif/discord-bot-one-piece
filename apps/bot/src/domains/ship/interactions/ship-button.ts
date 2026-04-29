import type { ButtonInteraction } from 'discord.js';

import { ValidationError } from '../../../discord/errors.js';
import type { ButtonHandler } from '../../../discord/types.js';
import { parseIntegerArg, assertMenuOwner } from '../../../discord/utils/index.js';
import { SHIP_BUTTON_NAME } from '../constants.js';
import { buildShipView } from '../ship-view.js';

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const ownerDiscordId = args[0];
  if (!ownerDiscordId) throw new ValidationError('Propriétaire du menu introuvable.');
  assertMenuOwner(interaction, ownerDiscordId);
  const playerId = parseIntegerArg(args[1]);

  await interaction.deferUpdate();
  await interaction.editReply(await buildShipView(playerId, ownerDiscordId));
}

export const shipButtonHandler: ButtonHandler = {
  name: SHIP_BUTTON_NAME,
  handle,
};
