import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import sampleSize from 'lodash/sampleSize.js';

import type { Command } from '../../../discord/types.js';
import { buildCustomId } from '../../../discord/utils/build-custom-id.js';
import { buildOpEmbed } from '../../../discord/utils/build-op-embed.js';
const EMOJIS: Array<{ emoji: string; name: string }> = [
  { emoji: '🍖', name: 'Viande' },
  { emoji: '🏴‍☠️', name: 'Drapeau' },
  { emoji: '⚓', name: 'Ancre' },
  { emoji: '🐉', name: 'Dragon' },
  { emoji: '🗺️', name: 'Carte' },
  { emoji: '🛶', name: 'Barque' },
  { emoji: '☠️', name: 'Crâne' },
  { emoji: '🍈', name: 'Fruit du Démon' },
  { emoji: '🦈', name: 'Requin' },
  { emoji: '🐟', name: 'poisson' },
  { emoji: '🏝️', name: 'Île' },
  { emoji: '⚔️', name: 'Épées' },
  { emoji: '🔫', name: 'Pistolet' },
  { emoji: '🔪', name: 'Poignard' },
];

export const emojiCommand: Command = {
  name: 'emoji',
  async handler(message) {
    const embed = buildOpEmbed().setTitle('Emojis').setDescription('Choisis un emoji ! ');
    const fiveEmojis = sampleSize(EMOJIS, 5);
    const buttons = fiveEmojis.map((emoji) =>
      new ButtonBuilder()
        .setCustomId(buildCustomId('emojibtn', emoji.emoji, emoji.name))
        .setEmoji(emoji.emoji)
        .setStyle(ButtonStyle.Secondary),
    );
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);
    await message.reply({ embeds: [embed], components: [row] });
  },
};
