import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import { PAGINATION } from '../constants.js';

export function buildBackButton(customId: string): ButtonBuilder {
  return new ButtonBuilder()
    .setCustomId(customId)
    .setLabel(PAGINATION.previous.label)
    .setEmoji(PAGINATION.previous.emoji)
    .setStyle(ButtonStyle.Secondary);
}

export function buildBackAction(customId: string): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(buildBackButton(customId));
}
