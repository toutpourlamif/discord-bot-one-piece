import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import sampleSize from 'lodash/sampleSize.js';

import type { Command } from '../../../discord/types.js';
import { buildCustomId } from '../../../discord/utils/build-custom-id.js';
import { buildOpEmbed } from '../../../discord/utils/build-op-embed.js';
const EMOJIS: Array<string> = ['🍖', '🏴‍☠️', '⚓', '🐉', '🗺️', '🛶', '☠️', '🍈', '🦈', '🐟', '🏝️', '⚔️', '🔫', '🔪'];

export const emojiCommand: Command = {
  name: 'emoji',
  async handler(message, _args) {
    const embed = buildOpEmbed().setTitle('Emojis').setDescription('Choisis un emoji ! ');
    const fiveEmojis = sampleSize(EMOJIS, 5);
    const buttons = fiveEmojis.map((emoji, index) =>
      new ButtonBuilder().setCustomId(buildCustomId('emoji', index)).setEmoji(emoji).setStyle(ButtonStyle.Secondary),
    );
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);
    await message.reply({ embeds: [embed], components: [row] });
  },
};
