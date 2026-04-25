import type { DevilFruitTemplate } from '@one-piece/db';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import { DISCORD_BUTTON_LABEL_MAX_LENGTH } from '../../discord/constants.js';
import { buildCustomId } from '../../discord/utils/build-custom-id.js';
import { truncate } from '../../shared/utils.js';

export const INFO_BUTTON_NAME = 'infofruit';

// TODO: Replace with shared info architecture
export function buildDisambiguationRow(fruits: Array<DevilFruitTemplate>): ActionRowBuilder<ButtonBuilder> {
  const buttons = fruits.map((fruit) =>
    new ButtonBuilder()
      .setCustomId(buildCustomId(INFO_BUTTON_NAME, fruit.id))
      .setLabel(truncate(fruit.name, DISCORD_BUTTON_LABEL_MAX_LENGTH))
      .setStyle(ButtonStyle.Primary),
  );
  return new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);
}
