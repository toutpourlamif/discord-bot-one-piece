import type { Player, Ship } from '@one-piece/db';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import chunk from 'lodash/chunk.js';

import { DISCORD_ACTION_ROW_MAX_BUTTONS } from '../../../discord/constants.js';
import type { View } from '../../../discord/types.js';
import {
  buildCustomId,
  buildMenuButtons,
  buildOpEmbed,
  buildPaginationButtons,
  clampPage,
  splitIntoPages,
} from '../../../discord/utils/index.js';
import { buildAssetUrl } from '../../../shared/build-asset-url.js';
import type { CharacterRow } from '../../character/types.js';
import { getCharacterInstanceName } from '../../character/utils/index.js';
import { BOARDING_BUTTON_NAME, DISEMBARK_BUTTON_NAME, EMBARK_BUTTON_NAME } from '../constants.js';

import { getCrewCapacity } from './get-crew-capacity.js';
import { getCrewDisplayName } from './get-crew-display-name.js';

export function buildBoardingView(player: Player, ship: Ship, characters: Array<CharacterRow>, page: number, ownerDiscordId: string): View {
  const menuRow = buildMenuButtons(BOARDING_BUTTON_NAME, ownerDiscordId, player.id);

  const crew = characters.filter((c) => c.joinedCrewAt !== null);
  const reserve = characters.filter((c) => c.joinedCrewAt === null);

  const reservePages = splitIntoPages(reserve.map(formatLine));
  const pageCount = 1 + reservePages.length;
  const currentPage = clampPage(page, pageCount);

  const embed = buildOpEmbed();
  const isCrewPage = currentPage === 0;

  if (isCrewPage) {
    const crewCapacity = getCrewCapacity(ship);
    embed.setTitle(`${getCrewDisplayName(player)} (${crew.length}/${crewCapacity})`).setDescription(crew.map(formatLine).join('\n'));
    const captain = crew.find((character) => character.isCaptain);
    if (captain?.imageUrl) {
      embed.setThumbnail(buildAssetUrl(captain.imageUrl));
    }
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
    components: [
      ...buildPaginationButtons(BOARDING_BUTTON_NAME, ownerDiscordId, player.id, currentPage, pageCount),
      ...buildDisembarkButtonRows(crew, page),
      ...buildEmbarkButtonRows(reserve, page),
      menuRow,
    ],
  };
}

function formatLine(row: CharacterRow): string {
  const prefix = row.isCaptain ? '⭐ ' : '';
  return `${prefix}${getCharacterInstanceName(row)}`;
}

function buildEmbarkButtonRows(crew: Array<CharacterRow>, page: number): Array<ActionRowBuilder<ButtonBuilder>> {
  return chunk(crew, DISCORD_ACTION_ROW_MAX_BUTTONS).map((rowCharacters) =>
    new ActionRowBuilder<ButtonBuilder>().addComponents(rowCharacters.map((c) => buildEmbarkButton(c, page))),
  );
}

function buildDisembarkButtonRows(crew: Array<CharacterRow>, page: number): Array<ActionRowBuilder<ButtonBuilder>> {
  return chunk(crew, DISCORD_ACTION_ROW_MAX_BUTTONS).map((rowCharacters) =>
    new ActionRowBuilder<ButtonBuilder>().addComponents(rowCharacters.map((c) => buildDisembarkButton(c, page))),
  );
}

function buildEmbarkButton(character: CharacterRow, page: number): ButtonBuilder {
  return new ButtonBuilder()
    .setCustomId(buildCustomId(EMBARK_BUTTON_NAME, character.instanceId, page))
    .setLabel(getCharacterInstanceName(character))
    .setStyle(ButtonStyle.Success);
}

function buildDisembarkButton(character: CharacterRow, page: number): ButtonBuilder {
  return new ButtonBuilder()
    .setCustomId(buildCustomId(DISEMBARK_BUTTON_NAME, character.instanceId, page))
    .setLabel(getCharacterInstanceName(character))
    .setStyle(ButtonStyle.Danger)
    .setDisabled(character.isCaptain);
}
