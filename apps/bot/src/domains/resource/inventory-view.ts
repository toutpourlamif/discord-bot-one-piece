import type { Player } from '@one-piece/db';

import type { View } from '../../discord/types.js';
import { buildMenuButtons } from '../../discord/utils/build-menu-buttons.js';
import { buildOpEmbed } from '../../discord/utils/build-op-embed.js';
import { buildPaginationButtons } from '../../discord/utils/build-pagination-buttons.js';
import { clampPage, splitIntoPages } from '../../discord/utils/paginate.js';

import { INVENTORY_BUTTON_NAME } from './constants.js';
import type { Inventory } from './types.js';

const EMPTY_INVENTORY_DESCRIPTION = 'Inventaire vide';

export function buildInventoryView(player: Player, inventory: Inventory, page: number): View {
  const embed = buildOpEmbed().setTitle(`Inventaire de ${player.name}`);
  const menuRow = buildMenuButtons(INVENTORY_BUTTON_NAME, player.id);

  if (inventory.length === 0) {
    embed.setDescription(EMPTY_INVENTORY_DESCRIPTION);
    return { embeds: [embed], components: [menuRow] };
  }

  const lines = inventory.map((item) => `${item.name} — ${item.quantity}`);
  const pages = splitIntoPages(lines);
  const currentPage = clampPage(page, pages.length);
  const pageContent = pages[currentPage];
  if (!pageContent) throw new Error(`Page d'inventaire introuvable: ${currentPage}/${pages.length}`);
  embed.setDescription(pageContent);
  if (pages.length > 1) {
    embed.setFooter({ text: `Page ${currentPage + 1}/${pages.length}` });
  }

  return {
    embeds: [embed],
    components: [...buildPaginationButtons(INVENTORY_BUTTON_NAME, player.id, currentPage, pages.length), menuRow],
  };
}
