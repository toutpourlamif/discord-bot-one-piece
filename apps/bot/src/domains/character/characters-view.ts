import type { Player, Ship } from '@one-piece/db';

import type { View } from '../../discord/types.js';
import { buildMenuButtons, buildOpEmbed, buildPaginationButtons, clampPage, splitIntoPages } from '../../discord/utils/index.js';
import { getCrewCapacity } from '../crew/capacity.js';

import { CHARACTERS_BUTTON_NAME } from './constants.js';
import type { CharacterRow } from './types.js';
import { getCharacterInstanceName } from './utils/index.js';

export function buildCharactersView(
  player: Player,
  ship: Ship,
  characters: Array<CharacterRow>,
  page: number,
  ownerDiscordId: string,
): View {
  const menuRow = buildMenuButtons(CHARACTERS_BUTTON_NAME, ownerDiscordId, player.id);

  const crew = characters.filter((c) => c.joinedCrewAt !== null);
  const reserve = characters.filter((c) => c.joinedCrewAt === null);

  const reservePages = splitIntoPages(reserve.map(formatLine));
  const pageCount = 1 + reservePages.length;
  const currentPage = clampPage(page, pageCount);

  const embed = buildOpEmbed();
  const isCrewPage = currentPage === 0;

  if (isCrewPage) {
    const crewCapacity = getCrewCapacity(ship);
    embed.setTitle(`Équipage de ${player.name} (${crew.length}/${crewCapacity})`).setDescription(crew.map(formatLine).join('\n'));
  } else {
    const reservePage = reservePages[currentPage - 1];
    if (!reservePage) throw new Error(`Page de réserve introuvable: ${currentPage}/${reservePages.length}`);
    embed.setTitle(`Réserve de ${player.name}`).setDescription(reservePage);
  }

  if (pageCount > 1) {
    embed.setFooter({ text: `Page ${currentPage + 1}/${pageCount}` });
  }

  return {
    embeds: [embed],
    components: [...buildPaginationButtons(CHARACTERS_BUTTON_NAME, ownerDiscordId, player.id, currentPage, pageCount), menuRow],
  };
}

function formatLine(row: CharacterRow): string {
  const prefix = row.isCaptain ? '⭐ ' : '';
  return `${prefix}${getCharacterInstanceName(row)}`;
}
