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
import type { Character } from '../../character/types.js';
import { BOARDING_BUTTON_NAME, DISEMBARK_BUTTON_NAME, EMBARK_BUTTON_NAME } from '../constants.js';

import { formatCharacterName } from './format-character-name.js';
import { getCrewCapacity } from './get-crew-capacity.js';
import { getCrewDisplayName } from './get-crew-display-name.js';
import { isInCrewFilter } from './is-in-crew-filter.js';

export function buildBoardingView(player: Player, ship: Ship, characters: Array<Character>, page: number, ownerDiscordId: string): View {
  const menuRow = buildMenuButtons(BOARDING_BUTTON_NAME, ownerDiscordId, player);

  const crew = characters.filter(isInCrewFilter);
  const reserve = characters.filter((c) => c.joinedCrewAt === null);

  const reservePages = splitIntoPages(reserve.map(formatCharacterName));
  const pageCount = reservePages.length;
  const currentPage = clampPage(page, pageCount);

  const embed = buildOpEmbed();
  const crewCapacity = getCrewCapacity(ship);
  embed.setTitle(`Composition de ${getCrewDisplayName(player)} (${crew.length}/${crewCapacity})`);

  const reservePage = reservePages[currentPage] ?? '';
  const crewLines = crew.map(formatCharacterName).join('\n');
  embed.setDescription(`**À bord**\n${crewLines}\n\n**Réserve**\n${reservePage}`);

  if (pageCount > 1) {
    embed.setFooter({ text: `Page ${currentPage + 1}/${pageCount}` });
  }

  return {
    embeds: [embed],
    components: [
      ...buildPaginationButtons(BOARDING_BUTTON_NAME, ownerDiscordId, player.id, currentPage, pageCount),
      ...buildDisembarkButtonRows(crew, page, ownerDiscordId),
      ...buildEmbarkButtonRows(reserve, page, ownerDiscordId),
      menuRow,
    ],
  };
}

function buildEmbarkButtonRows(crew: Array<Character>, page: number, ownerDiscordId: string): Array<ActionRowBuilder<ButtonBuilder>> {
  return chunk(crew, DISCORD_ACTION_ROW_MAX_BUTTONS).map((rowCharacters) =>
    new ActionRowBuilder<ButtonBuilder>().addComponents(rowCharacters.map((c) => buildEmbarkButton(c, page, ownerDiscordId))),
  );
}

function buildDisembarkButtonRows(crew: Array<Character>, page: number, ownerDiscordId: string): Array<ActionRowBuilder<ButtonBuilder>> {
  return chunk(crew, DISCORD_ACTION_ROW_MAX_BUTTONS).map((rowCharacters) =>
    new ActionRowBuilder<ButtonBuilder>().addComponents(rowCharacters.map((c) => buildDisembarkButton(c, page, ownerDiscordId))),
  );
}

function buildEmbarkButton(character: Character, page: number, ownerDiscordId: string): ButtonBuilder {
  return new ButtonBuilder()
    .setCustomId(buildCustomId(EMBARK_BUTTON_NAME, ownerDiscordId, character.instanceId, page))
    .setLabel(character.name)
    .setStyle(ButtonStyle.Success);
}

function buildDisembarkButton(character: Character, page: number, ownerDiscordId: string): ButtonBuilder {
  return new ButtonBuilder()
    .setCustomId(buildCustomId(DISEMBARK_BUTTON_NAME, ownerDiscordId, character.instanceId, page))
    .setLabel(character.name)
    .setStyle(ButtonStyle.Danger)
    .setDisabled(character.isCaptain);
}
