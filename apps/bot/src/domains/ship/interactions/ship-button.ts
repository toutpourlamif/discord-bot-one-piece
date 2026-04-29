import type { ButtonInteraction } from 'discord.js';

import type { ButtonHandler } from '../../../discord/types.js';
import { parseIntegerArg, assertMenuOwner } from '../../../discord/utils/index.js';
import * as playerRepository from '../../player/repository.js';
import { SHIP_BUTTON_NAME } from '../constants.js';
import { buildShipView } from '../ship-view.js';

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const playerId = parseIntegerArg(args[0]);
  const player = await playerRepository.findByIdOrThrow(playerId);
  if (!(await assertMenuOwner(interaction, player.discordId))) return;

  await interaction.deferUpdate();
  await interaction.editReply(await buildShipView(player.id));
}

export const shipButtonHandler: ButtonHandler = {
  name: SHIP_BUTTON_NAME,
  handle,
};
