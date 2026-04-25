import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import { buildCustomId } from '../../utils/build-custom-id.js';
import { allMenuViews, type MenuViewKey } from '../views/registry.js';

import { MENU_BUTTON_NAME } from './constants.js';

export function buildNavigationRow(currentKey: MenuViewKey, playerId: number): ActionRowBuilder<ButtonBuilder> {
  const buttons = allMenuViews.map((view) => {
    const btn = new ButtonBuilder()
      .setCustomId(buildCustomId(MENU_BUTTON_NAME, view.key, playerId))
      .setLabel(view.label)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(view.key === currentKey)
      .setEmoji(view.emoji);
    return btn;
  });
  return new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);
}
