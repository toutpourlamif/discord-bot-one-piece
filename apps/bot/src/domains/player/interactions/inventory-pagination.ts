import type { ButtonInteraction } from 'discord.js';

import type { ButtonHandler } from '../../../discord/types.js';
import { buildInventoryView, INVENTORY_CUSTOM_ID_PREFIX, parseInventoryCustomId } from '../inventory-view.js';
import * as playerRepository from '../repository.js';

async function handle(interaction: ButtonInteraction): Promise<void> {
  const parsed = parseInventoryCustomId(interaction.customId);
  if (!parsed) return;

  await interaction.deferUpdate();

  const player = await playerRepository.findById(parsed.playerId);
  if (!player) {
    await interaction.editReply({ content: 'Joueur introuvable.', embeds: [], components: [] });
    return;
  }

  const resources = await playerRepository.findInventoryByPlayerId(player.id);
  await interaction.editReply(buildInventoryView(player, resources, parsed.page));
}

export const inventoryPaginationButtonHandler: ButtonHandler = {
  customIdPrefix: INVENTORY_CUSTOM_ID_PREFIX,
  handle,
};
