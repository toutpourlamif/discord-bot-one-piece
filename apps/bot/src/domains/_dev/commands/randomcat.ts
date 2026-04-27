import type { ButtonBuilder } from 'discord.js';
import { ActionRowBuilder } from 'discord.js';

import type { Command } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/build-op-embed.js';

import { buildRandomCatButton } from './randomcat-button.js';

const catImages = ['https://i.imgur.com/xJ4oIrC.jpeg', 'https://i.imgur.com/g2BEPjU.jpeg', 'https://i.imgur.com/c7FhEn6.png'];

export const randomCatCommand: Command = {
  name: 'randomcat',
  async handler(message) {
    const randomUrl = catImages[Math.floor(Math.random() * catImages.length)]!;

    const embed = buildOpEmbed().setTitle('UN CHAT 🐱 !').setImage(randomUrl);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(buildRandomCatButton());

    await message.reply({ embeds: [embed], components: [row] });
  },
};
