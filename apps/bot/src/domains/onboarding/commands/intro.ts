import type { Command } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/index.js';

export const introCommand: Command = {
  names: { fr: 'intro', en: 'intro' },
  requiresSynchronization: false,
  async handler(ctx) {
    await ctx.message.reply({
      // TODO: trouver un meilleur texte
      embeds: [buildOpEmbed('info').setTitle('Ton aventure a déjà commencé !').setDescription('Tu es déjà en mer, pirate.')],
      components: [],
    });
  },
};
