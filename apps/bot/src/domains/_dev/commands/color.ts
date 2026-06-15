import type { Command } from '../../../discord/types.js';
import { buildOpEmbed, convertJsHexToCssHex } from '../../../discord/utils/index.js';

function getRandomColor(): number {
  return Math.floor(Math.random() * 0xffffff);
}

export const colorCommand: Command = {
  name: 'color',
  async handler({ message }) {
    const color = getRandomColor();
    const hex = convertJsHexToCssHex(color);

    const embed = buildOpEmbed().setTitle('🎨 Couleur aléatoire').setDescription(`Couleur tirée au hasard : **${hex}**`).setColor(color);

    await message.reply({ embeds: [embed] });
  },
};
