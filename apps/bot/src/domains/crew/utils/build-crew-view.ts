import type { Player, Ship } from '@one-piece/db';
import type { AttachmentBuilder } from 'discord.js';

import type { View } from '../../../discord/types.js';
import {
  attachImage,
  buildMenuButtons,
  buildOpEmbed,
  buildPaginationButtons,
  clampPage,
  splitIntoPages,
} from '../../../discord/utils/index.js';
import { buildAssetUrl } from '../../../shared/build-asset-url.js';
import { pluralize } from '../../../shared/pluralize.js';
import type { Character } from '../../character/types.js';
import { formatBerry } from '../../economy/utils/format-berry.js';
import { buildCrewCard } from '../cards/build-crew-card.js';
import { CREW_BUTTON_NAME } from '../constants.js';

import { formatCharacterName } from './format-character-name.js';
import { getCrewCapacity } from './get-crew-capacity.js';
import { getCrewDisplayName } from './get-crew-display-name.js';
import { isInCrewFilter } from './is-in-crew-filter.js';

export async function buildCrewView(
  player: Player,
  ship: Ship,
  characters: Array<Character>,
  page: number,
  ownerDiscordId: string,
): Promise<View> {
  const menuRow = buildMenuButtons(CREW_BUTTON_NAME, ownerDiscordId, player);

  const crew = characters.filter(isInCrewFilter);
  const reserve = characters.filter((c) => c.joinedCrewAt === null);

  const reservePages = splitIntoPages(reserve.map(formatCharacterName));
  const pageCount = 1 + reservePages.length;
  const currentPage = clampPage(page, pageCount);

  const embed = buildOpEmbed();
  const isCrewPage = currentPage === 0;
  const files: Array<AttachmentBuilder> = [];

  if (isCrewPage) {
    const memberList = crew.map(formatCharacterName).join(', ');
    const remainingSlots = getCrewCapacity(ship) - crew.length;
    const remainingText = remainingSlots > 0 ? ` (${pluralize(remainingSlots, 'place restante', 'places restantes')})` : '';

    embed.setTitle(getCrewDisplayName(player));
    embed.setDescription(`${memberList}${remainingText}`);
    const captain = crew.find((character) => character.isCaptain);
    if (captain?.imageUrl) {
      embed.setThumbnail(buildAssetUrl(captain.imageUrl));
    }
    if (crew.length > 0) attachImage({ embed, files, image: await buildCrewCard(crew) });
  } else {
    const reservePage = reservePages[currentPage - 1];
    if (!reservePage) throw new Error(`Page de réserve introuvable: ${currentPage}/${reservePages.length}`);
    embed.setTitle(`Réserve de ${player.name}`).setDescription(reservePage);
  }

  const footerParts: Array<string> = [];
  if (isCrewPage) footerParts.push(`Prime : ${formatBerry(player.bounty)}`);
  if (pageCount > 1) footerParts.push(`Page ${currentPage + 1}/${pageCount}`);
  if (footerParts.length > 0) embed.setFooter({ text: footerParts.join(' • ') });

  return {
    embeds: [embed],
    components: [...buildPaginationButtons(CREW_BUTTON_NAME, ownerDiscordId, player.id, currentPage, pageCount), menuRow],
    files,
  };
}
