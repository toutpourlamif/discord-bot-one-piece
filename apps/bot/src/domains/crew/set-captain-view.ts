import type { Player } from '@one-piece/db';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import chunk from 'lodash/chunk.js';

import { DISCORD_ACTION_ROW_MAX_BUTTONS, DISCORD_MESSAGE_MAX_BUTTONS } from '../../discord/constants.js';
import type { View } from '../../discord/types.js';
import { buildCustomId } from '../../discord/utils/build-custom-id.js';
import { buildOpEmbed } from '../../discord/utils/build-op-embed.js';
import type { CharacterRow } from '../character/types.js';

import { SET_CAPTAIN_BUTTON_NAME } from './constants.js';

export function buildSetCaptainView(player: Player, crew: Array<CharacterRow>): View {
  const visibleCrew = crew.slice(0, DISCORD_MESSAGE_MAX_BUTTONS);

  return {
    embeds: [buildOpEmbed().setTitle(`Capitaine de ${player.name}`).setDescription('Choisis le capitaine de ton équipage.')],
    components: buildCaptainButtonRows(visibleCrew),
  };
}

function buildCaptainButtonRows(crew: Array<CharacterRow>): Array<ActionRowBuilder<ButtonBuilder>> {
  return chunk(crew, DISCORD_ACTION_ROW_MAX_BUTTONS).map((rowCharacters) =>
    new ActionRowBuilder<ButtonBuilder>().addComponents(rowCharacters.map(buildCaptainButton)),
  );
}

function buildCaptainButton(character: CharacterRow): ButtonBuilder {
  return new ButtonBuilder()
    .setCustomId(buildCustomId(SET_CAPTAIN_BUTTON_NAME, character.instanceId))
    .setLabel(character.name)
    .setStyle(character.isCaptain ? ButtonStyle.Primary : ButtonStyle.Secondary);
}
