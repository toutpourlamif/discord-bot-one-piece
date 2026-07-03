import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import type { View } from '../../../../../discord/types.js';
import { buildBackAction, buildCustomId, buildOpEmbed } from '../../../../../discord/utils/index.js';
import { formatBerry } from '../../../../economy/index.js';
import { TAVERN_SECTION_BUTTON_NAME } from '../../../constants.js';
import { COIN_FLIP_PLAY_BUTTON_NAME, COIN_SIDES } from '../constants.js';

type BuildChooseSideViewParams = {
  betAmount: bigint;
  ownerDiscordId: string;
  playerId: number;
};

export function buildChooseSideView({ betAmount, ownerDiscordId, playerId }: BuildChooseSideViewParams): View {
  const embed = buildOpEmbed()
    .setTitle('🪙 Pile ou Face')
    .setDescription(`Tu mises **${formatBerry(betAmount)}**. Sur quoi tu paries ?`);

  const coinSideButtons = Object.entries(COIN_SIDES).map(([side, { label, emoji }]) =>
    new ButtonBuilder()
      .setCustomId(buildCustomId(COIN_FLIP_PLAY_BUTTON_NAME, ownerDiscordId, playerId, betAmount.toString(), side))
      .setLabel(label)
      .setEmoji(emoji)
      .setStyle(ButtonStyle.Primary),
  );
  const coinSidesRow = new ActionRowBuilder<ButtonBuilder>().addComponents(...coinSideButtons);

  const backRow = buildBackAction(buildCustomId(TAVERN_SECTION_BUTTON_NAME, ownerDiscordId, playerId, 'games'));

  return { embeds: [embed], components: [coinSidesRow, backRow] };
}
