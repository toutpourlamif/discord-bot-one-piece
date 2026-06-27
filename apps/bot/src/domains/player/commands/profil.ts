import type { Command } from '../../../discord/types.js';
import { buildProfilView } from '../build-profil-view.js';
import { resolveTargetPlayer } from '../utils/index.js';

export const profilCommand: Command = {
  names: { fr: 'profil', en: 'profile' },
  aliases: { fr: ['p'], en: ['p'] },
  async handler(ctx) {
    const { targetPlayer } = await resolveTargetPlayer(ctx);
    await ctx.message.reply(await buildProfilView(targetPlayer.id, ctx.message.author.id));
  },
};
