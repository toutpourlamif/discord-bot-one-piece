import { TAVERN_BY_ZONE, ZONE_LABELS } from '@one-piece/db';

import type { Command } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/index.js';
import { assertPlayerIsNotAtSea } from '../../navigation/guards/index.js';
import { buildTavernView } from '../views/build-tavern-view.js';

export const tavernCommand: Command = {
  name: ['tavern', 'taverne'],
  async handler(ctx) {
    assertPlayerIsNotAtSea(ctx.player);

    const tavernConfig = TAVERN_BY_ZONE[ctx.player.currentZone];
    if (tavernConfig === undefined) {
      await ctx.message.reply({
        embeds: [buildOpEmbed().setDescription(`Il n'y a malheureusement pas de taverne à ${ZONE_LABELS[ctx.player.currentZone]}.`)],
      });
      return;
    }

    await ctx.message.reply(buildTavernView({ player: ctx.player, ownerDiscordId: ctx.message.author.id, tavernConfig }));
  },
};
