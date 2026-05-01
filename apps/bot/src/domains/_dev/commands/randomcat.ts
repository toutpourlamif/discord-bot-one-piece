import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import type { Command } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/index.js';

const catImages = ['https://i.imgur.com/xJ4oIrC.jpeg', 'https://i.imgur.com/g2BEPjU.jpeg', 'https://i.imgur.com/c7FhEn6.png'];

const catButton = new ButtonBuilder().setCustomId('cat').setLabel('Chat').setEmoji('🐱').setStyle(ButtonStyle.Secondary);

const row = new ActionRowBuilder<ButtonBuilder>().addComponents(catButton);

export const randomCatCommand: Command = {
  name: 'randomcat',
  async handler(message) {
    const randomUrl = catImages[Math.floor(Math.random() * catImages.length)]!;

    const embed = buildOpEmbed().setTitle('UN CHAT 🐱 !').setImage(randomUrl);

    await message.reply({ embeds: [embed], components: [row] });
  },
};
