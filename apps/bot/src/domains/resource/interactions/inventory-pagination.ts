import type { ButtonInteraction } from 'discord.js';

import type { ButtonHandler } from '../../../discord/types.js';
import * as playerRepository from '../../player/repository.js';
import { INVENTORY_BUTTON_NAME } from '../constants.js';
import { buildInventoryView } from '../inventory-view.js';
import { getInventory } from '../repository.js';

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const playerId = Number(args[0]);
  const page = Number(args[1]);
  if (!Number.isInteger(playerId) || !Number.isInteger(page)) {
    throw new Error(`arguments invalides dans inventory pagination: ${interaction.customId}`);
  }

  await interaction.deferUpdate();

  const player = await playerRepository.findById(playerId);
  if (!player) {
    await interaction.editReply({ content: 'Joueur introuvable.', embeds: [], components: [] });
    return;
  }

  const inventory = await getInventory(player.id);
  await interaction.editReply(buildInventoryView(player, inventory, page));
}

export const inventoryPaginationButtonHandler: ButtonHandler = {
  name: INVENTORY_BUTTON_NAME,
  handle,
};
