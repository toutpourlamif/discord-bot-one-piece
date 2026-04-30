import type { ButtonInteraction } from 'discord.js';

import type { ButtonHandler } from '../../../discord/types.js';
import { assertMenuOwner, parseIntegerArg, parseMenuOwnerDiscordId } from '../../../discord/utils/index.js';
import * as playerRepository from '../../player/repository.js';
import { INVENTORY_BUTTON_NAME } from '../constants.js';
import { buildInventoryView } from '../inventory-view.js';
import { getInventory } from '../repository.js';

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const ownerDiscordId = parseMenuOwnerDiscordId(args[0]);
  assertMenuOwner(interaction, ownerDiscordId);
  const playerId = parseIntegerArg(args[1]);
  const page = parseIntegerArg(args[2]);

  await interaction.deferUpdate();

  const player = await playerRepository.findByIdOrThrow(playerId);

  const inventory = await getInventory(player.id);
  await interaction.editReply(buildInventoryView(player, inventory, page, ownerDiscordId));
}

export const inventoryPaginationButtonHandler: ButtonHandler = {
  name: INVENTORY_BUTTON_NAME,
  handle,
};
