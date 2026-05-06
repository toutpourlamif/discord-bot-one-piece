import type { Command } from '../../../discord/types.js';
import { resolveTargetPlayer } from '../../player/index.js';
import { buildShipView } from '../ship-view.js';

export const shipCommand: Command = {
  name: 'ship',
  async handler(ctx) {
    const targetPlayer = await resolveTargetPlayer(ctx);
    await ctx.message.reply(await buildShipView(targetPlayer.id, ctx.message.author.id));
  },
};
