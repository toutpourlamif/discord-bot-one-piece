import type { Command } from '../../../discord/types.js';
import { buildProfilView } from '../build-profil-view.js';
import { resolveTargetPlayer } from '../utils/index.js';

export const profilCommand: Command = {
  name: 'profil',
  async handler(ctx) {
    const { targetPlayer } = await resolveTargetPlayer(ctx);
    await ctx.message.reply(await buildProfilView(targetPlayer.id, ctx.message.author.id));
  },
};
