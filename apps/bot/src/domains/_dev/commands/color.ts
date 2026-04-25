import type { Command } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/build-op-embed.js';

function getRandomColor(): number {
  return Math.floor(Math.random() * 0xffffff);
}

function toHex(color: number): string {
  return `#${color.toString(16).padStart(6, '0').toUpperCase()}`;
}

export const colorCommand: Command = {
  name: 'color',
  async handler(message) {
    const color = getRandomColor();
    const hex = toHex(color);

    const embed = buildOpEmbed().setTitle('🎨 Couleur aléatoire').setDescription(`Couleur tirée au hasard : **${hex}**`).setColor(color);

    await message.reply({ embeds: [embed] });
  },
};
