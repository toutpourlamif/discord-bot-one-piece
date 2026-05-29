import type { Command } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/index.js';

export const introCommand: Command = {
  name: 'intro',
  requiresSynchronization: false,
  async handler(ctx) {
    await ctx.message.reply({
      embeds: [buildOpEmbed('info').setTitle('Ton aventure a déjà commencé !').setDescription('Tu es déjà en mer, pirate.')],
      components: [],
    });
  },
};
