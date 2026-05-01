import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import { PAGINATION } from '../constants.js';

import { buildCustomId } from './build-custom-id.js';

/** Build la row "Précédent / Suivant" pour un handler dont le customId est `<name>:<ownerDiscordId>:<playerId>:<page>`.
 *  Retourne un tableau vide si une seule page (rien à paginer) — à spread dans la liste de components. */
export function buildPaginationButtons(
  name: string,
  ownerDiscordId: string,
  playerId: number,
  currentPage: number,
  pageCount: number,
): Array<ActionRowBuilder<ButtonBuilder>> {
  if (pageCount <= 1) return [];
  const isOnFirstPage = currentPage === 0;
  const isOnLastPage = currentPage === pageCount - 1;
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(buildCustomId(name, ownerDiscordId, playerId, currentPage - 1))
      .setLabel(PAGINATION.previous.label)
      .setEmoji(PAGINATION.previous.emoji)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(isOnFirstPage),
    new ButtonBuilder()
      .setCustomId(buildCustomId(name, ownerDiscordId, playerId, currentPage + 1))
      .setLabel(PAGINATION.next.label)
      .setEmoji(PAGINATION.next.emoji)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(isOnLastPage),
  );
  return [row];
}
