import type { Command } from '../../../discord/types.js';
import { assertPlayerIsNotAtSea } from '../../navigation/guards/index.js';
import { buildTavernView } from '../views/build-tavern-view.js';

export const tavernCommand: Command = {
  name: { fr: 'taverne', en: 'tavern' },
  async handler(ctx) {
    assertPlayerIsNotAtSea(ctx.player);
    await ctx.message.reply(buildTavernView({ player: ctx.player, ownerDiscordId: ctx.message.author.id }));
  },
};
