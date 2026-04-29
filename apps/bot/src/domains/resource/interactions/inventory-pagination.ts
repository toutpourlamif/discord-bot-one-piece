import type { ButtonInteraction } from 'discord.js';

import type { ButtonHandler } from '../../../discord/types.js';
import { assertMenuOwner } from '../../../discord/utils/assert-menu-owner.js';
import { parseIntegerArg } from '../../../discord/utils/parse-integer-arg.js';
import * as playerRepository from '../../player/repository.js';
import { INVENTORY_BUTTON_NAME } from '../constants.js';
import { buildInventoryView } from '../inventory-view.js';
import { getInventory } from '../repository.js';

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const playerId = parseIntegerArg(args[0]);
  const page = parseIntegerArg(args[1]);
  const player = await playerRepository.findByIdOrThrow(playerId);
  if (!(await assertMenuOwner(interaction, player.discordId))) return;

  await interaction.deferUpdate();

  const inventory = await getInventory(player.id);
  await interaction.editReply(buildInventoryView(player, inventory, page));
}

export const inventoryPaginationButtonHandler: ButtonHandler = {
  name: INVENTORY_BUTTON_NAME,
  handle,
};
