import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import sampleSize from 'lodash/sampleSize.js';

import { createOpEmbed } from '../../../discord/embed/create-op-embed.js';
import type { Command } from '../../../discord/types.js';

const EMOJIS: Array<string> = ['🍖', '🏴‍☠️', '⚓', '🐉', '🗺️', '🛶', '☠️', '🍈', '🦈', '🐟', '🏝️', '⚔️', '🔫', '🔪'];

export const emojiCommand: Command = {
  name: 'emoji',
  async handler(message, args) {
    const embed = createOpEmbed().setTitle('Emojis').setDescription('Choisis un emoji ! ');
    const fiveEmojis = sampleSize(EMOJIS, 5);
    const buttons = fiveEmojis.map((emojis, index) =>
      new ButtonBuilder().setCustomId(`emoji:${index}`).setEmoji(emojis).setStyle(ButtonStyle.Secondary),
    );
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);
    await message.reply({ embeds: [embed], components: [row] });
  },
};
