import type { Player } from '@one-piece/db';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import { PAGINATION } from '../../discord/constants.js';
import { createOpEmbed } from '../../discord/embed/create-op-embed.js';
import type { View } from '../../discord/types.js';
import { buildCustomId } from '../../discord/utils/build-custom-id.js';
import { clampPage, splitIntoPages } from '../../discord/utils/paginate.js';

import { INVENTORY_BUTTON_NAME } from './constants.js';
import type { Inventory } from './types.js';

const EMPTY_INVENTORY_DESCRIPTION = 'Inventaire vide';

export function buildInventoryView(player: Player, inventory: Inventory, page: number): View {
  const embed = createOpEmbed().setTitle(`Inventaire de ${player.name}`);

  if (inventory.length === 0) {
    embed.setDescription(EMPTY_INVENTORY_DESCRIPTION);
    return { embeds: [embed], components: [] };
  }

  const lines = inventory.map((item) => `${item.name} — ${item.quantity}`);
  const pages = splitIntoPages(lines);
  const currentPage = clampPage(page, pages.length);
  embed.setDescription(pages[currentPage] ?? '');
  if (pages.length > 1) {
    embed.setFooter({ text: `Page ${currentPage + 1}/${pages.length}` });
  }

  return {
    embeds: [embed],
    components: [buildPaginationButtons(player.id, currentPage, pages.length)],
  };
}

function buildPaginationButtons(playerId: number, currentPage: number, pageCount: number): ActionRowBuilder<ButtonBuilder> {
  const isOnCurrentPage = currentPage === 0;
  const isOnLastPage = currentPage === pageCount - 1;
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(buildCustomId(INVENTORY_BUTTON_NAME, playerId, currentPage - 1))
      .setLabel(PAGINATION.previous.label)
      .setEmoji(PAGINATION.previous.emoji)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(isOnCurrentPage),
    new ButtonBuilder()
      .setCustomId(buildCustomId(INVENTORY_BUTTON_NAME, playerId, currentPage + 1))
      .setLabel(PAGINATION.next.label)
      .setEmoji(PAGINATION.next.emoji)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(isOnLastPage),
  );
}
