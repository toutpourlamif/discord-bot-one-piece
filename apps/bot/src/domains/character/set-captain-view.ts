import type { Player } from '@one-piece/db';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import type { View } from '../../discord/types.js';
import { buildCustomId } from '../../discord/utils/build-custom-id.js';
import { buildOpEmbed } from '../../discord/utils/build-op-embed.js';

import { SET_CAPTAIN_BUTTON_NAME } from './constants.js';
import type { CharacterRow } from './types.js';

const BUTTONS_PER_ROW = 5;
const MAX_CAPTAIN_BUTTONS = 25;

export function buildSetCaptainView(player: Player, crew: Array<CharacterRow>): View {
  const visibleCrew = crew.slice(0, MAX_CAPTAIN_BUTTONS);

  return {
    embeds: [buildOpEmbed().setTitle(`Capitaine de ${player.name}`).setDescription('Choisis le capitaine de ton équipage.')],
    components: buildCaptainButtonRows(visibleCrew),
  };
}

function buildCaptainButtonRows(crew: Array<CharacterRow>): Array<ActionRowBuilder<ButtonBuilder>> {
  const rows: Array<ActionRowBuilder<ButtonBuilder>> = [];

  for (let index = 0; index < crew.length; index += BUTTONS_PER_ROW) {
    const rowCharacters = crew.slice(index, index + BUTTONS_PER_ROW);

    rows.push(
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        rowCharacters.map((character) =>
          new ButtonBuilder()
            .setCustomId(buildCustomId(SET_CAPTAIN_BUTTON_NAME, character.instanceId))
            .setLabel(character.name)
            .setStyle(character.isCaptain ? ButtonStyle.Success : ButtonStyle.Secondary),
        ),
      ),
    );
  }

  return rows;
}
