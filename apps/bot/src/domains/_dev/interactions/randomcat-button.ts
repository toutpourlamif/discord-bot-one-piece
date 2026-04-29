import type { ButtonInteraction } from 'discord.js';

import type { ButtonHandler } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/index.js';

export const randomCatButtonHandler: ButtonHandler = {
  name: 'cat',
  async handle(interaction: ButtonInteraction) {
    const embed = buildOpEmbed().setDescription(`customId reçu : ${interaction.customId}`);
    await interaction.reply({ embeds: [embed] });
  },
};
