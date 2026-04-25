import type { Player } from '@one-piece/db';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import { CUSTOM_ID_SEPARATOR, DISCORD_CUSTOM_ID_MAX_LENGTH, DISCORD_EMBED_DESCRIPTION_MAX_LENGTH } from '../../discord/constants.js';
import { createOpEmbed } from '../../discord/embed/create-op-embed.js';

import type { InventoryResource } from './repository.js';

export const INVENTORY_CUSTOM_ID_PREFIX = `inventory${CUSTOM_ID_SEPARATOR}`;

const EMPTY_INVENTORY_DESCRIPTION = 'Inventaire vide';
const INVENTORY_PREVIOUS_ACTION = 'previous';
const INVENTORY_NEXT_ACTION = 'next';

export type InventoryAction = typeof INVENTORY_PREVIOUS_ACTION | typeof INVENTORY_NEXT_ACTION;

export function buildInventoryView(player: Player, resources: Array<InventoryResource>, page: number) {
  const pages = buildInventoryPages(resources);
  const currentPage = clampPage(page, pages.length);
  const embed = createOpEmbed()
    .setTitle(`Inventaire de ${player.name}`)
    .setDescription(pages[currentPage] ?? EMPTY_INVENTORY_DESCRIPTION);

  if (pages.length > 1) {
    embed.setFooter({ text: `Page ${currentPage + 1}/${pages.length}` });
    return {
      embeds: [embed],
      components: [buildInventoryPaginationRow(player.id, currentPage, pages.length)],
    };
  }

  return { embeds: [embed], components: [] };
}

export function parseInventoryCustomId(customId: string): { action: InventoryAction; playerId: number; page: number } | undefined {
  const [prefix, action, playerIdStr, pageStr] = customId.split(CUSTOM_ID_SEPARATOR);
  if (`${prefix}${CUSTOM_ID_SEPARATOR}` !== INVENTORY_CUSTOM_ID_PREFIX) return undefined;
  if (action !== INVENTORY_PREVIOUS_ACTION && action !== INVENTORY_NEXT_ACTION) return undefined;

  const playerId = Number(playerIdStr);
  const page = Number(pageStr);
  if (!Number.isInteger(playerId) || !Number.isInteger(page)) return undefined;

  return { action, playerId, page };
}

function buildInventoryPages(resources: Array<InventoryResource>): Array<string> {
  if (resources.length === 0) return [EMPTY_INVENTORY_DESCRIPTION];

  const pages: Array<string> = [];
  let currentLines: Array<string> = [];
  let currentLength = 0;

  for (const resource of resources) {
    const line = `${resource.name} — ${resource.quantity}`;
    const separatorLength = currentLines.length > 0 ? 1 : 0;
    const nextLength = currentLength + separatorLength + line.length;

    if (currentLines.length > 0 && nextLength > DISCORD_EMBED_DESCRIPTION_MAX_LENGTH) {
      pages.push(currentLines.join('\n'));
      currentLines = [];
      currentLength = 0;
    }

    currentLines.push(line);
    currentLength += (currentLines.length > 1 ? 1 : 0) + line.length;
  }

  if (currentLines.length > 0) {
    pages.push(currentLines.join('\n'));
  }

  return pages;
}

function buildInventoryPaginationRow(playerId: number, currentPage: number, pageCount: number): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(buildInventoryCustomId(INVENTORY_PREVIOUS_ACTION, playerId, currentPage - 1))
      .setLabel('Précédent')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(currentPage === 0),
    new ButtonBuilder()
      .setCustomId(buildInventoryCustomId(INVENTORY_NEXT_ACTION, playerId, currentPage + 1))
      .setLabel('Suivant')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(currentPage === pageCount - 1),
  );
}

function buildInventoryCustomId(action: InventoryAction, playerId: number, page: number): string {
  const customId = [INVENTORY_CUSTOM_ID_PREFIX.slice(0, -1), action, playerId, page].join(CUSTOM_ID_SEPARATOR);
  if (customId.length > DISCORD_CUSTOM_ID_MAX_LENGTH) {
    throw new Error(`customId inventaire trop long: ${customId.length}`);
  }

  return customId;
}

function clampPage(page: number, pageCount: number): number {
  return Math.min(Math.max(page, 0), pageCount - 1);
}
