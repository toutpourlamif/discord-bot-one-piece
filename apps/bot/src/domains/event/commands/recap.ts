import type { Command } from '../../../discord/types.js';
import { buildRecapView } from '../recap/build-recap-view.js';

export const recapCommand: Command = {
  names: { fr: 'recap', en: 'recap' },
  aliases: { fr: ['r'], en: ['r'] },
  requiresSynchronization: false,
  async handler(ctx) {
    await ctx.message.reply(await buildRecapView(ctx.player));
  },
};
