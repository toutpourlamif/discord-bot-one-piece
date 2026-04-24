import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import { CUSTOM_ID_SEPARATOR } from '../../constants.js';
import { allMenuViews, type MenuViewKey } from '../views/registry.js';

export function buildNavigationRow(currentKey: MenuViewKey, playerId: number): ActionRowBuilder<ButtonBuilder> {
  const buttons = allMenuViews.map((view) => {
    const btn = new ButtonBuilder()
      .setCustomId(['menu', view.key, playerId].join(CUSTOM_ID_SEPARATOR))
      .setLabel(view.label)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(view.key === currentKey)
      .setEmoji(view.emoji);
    return btn;
  });
  return new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);
}
