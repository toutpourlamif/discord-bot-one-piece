import type { Command } from '../../../discord/types.js';
import { resolveTargetPlayer } from '../../player/index.js';
import { buildShipView } from '../views/index.js';

export const shipCommand: Command = {
  names: { fr: 'navire', en: 'ship' },
  aliases: { fr: ['bateau'], en: ['boat'] },
  async handler(ctx) {
    const { targetPlayer } = await resolveTargetPlayer(ctx);
    await ctx.message.reply(await buildShipView(targetPlayer, ctx.message.author.id));
  },
};
