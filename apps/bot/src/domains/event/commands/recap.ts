import type { Command } from '../../../discord/types.js';
import { buildRecapView } from '../recap/build-recap-view.js';

export const recapCommand: Command = {
  name: 'recap',
  requiresSynchronization: false,
  async handler(ctx) {
    await ctx.message.reply(await buildRecapView(ctx.player));
  },
};
