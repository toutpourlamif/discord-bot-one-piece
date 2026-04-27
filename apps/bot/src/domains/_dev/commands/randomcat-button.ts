import { ButtonBuilder, ButtonStyle } from 'discord.js';

export function buildRandomCatButton(): ButtonBuilder {
  return new ButtonBuilder().setCustomId('randomcat').setLabel('Chat').setEmoji('🐱').setStyle(ButtonStyle.Secondary).setDisabled(true);
}
