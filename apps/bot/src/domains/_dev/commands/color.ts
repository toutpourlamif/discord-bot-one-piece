import type { Command } from '../../../shared/command.js';
import { createOpEmbed } from '../../../shared/embed/create-op-embed.js';

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

    const embed = createOpEmbed().setTitle('🎨 Couleur aléatoire').setDescription(`Couleur tirée au hasard : **${hex}**`).setColor(color);

    await message.reply({ embeds: [embed] });
  },
};
