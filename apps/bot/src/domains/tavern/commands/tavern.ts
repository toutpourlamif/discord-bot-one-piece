import { TAVERN_BY_ZONE, ZONE_LABELS } from '@one-piece/db';

import type { Command } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/index.js';
import { isSea } from '../../navigation/utils/index.js';
import { buildTavernView } from '../views/build-tavern-view.js';

export const tavernCommand: Command = {
  name: ['tavern', 'taverne'],
  async handler(ctx) {
    if (ctx.player.travelTargetZone !== null) {
      await ctx.message.reply({ embeds: [buildOpEmbed().setDescription('🌊 Tu es en mer : reviens à quai pour entrer dans une taverne.')] });
      return;
    }
    if (isSea(ctx.player.currentZone)) {
      await ctx.message.reply({ embeds: [buildOpEmbed().setDescription('🌊 Tu es en mer : reviens à quai pour entrer dans une taverne.')] });
      return;
    }

    const tavern = TAVERN_BY_ZONE[ctx.player.currentZone];
    if (tavern === undefined) {
      await ctx.message.reply({ embeds: [buildOpEmbed().setDescription(`Pas de taverne à ${ZONE_LABELS[ctx.player.currentZone]}.`)] });
      return;
    }

    await ctx.message.reply(buildTavernView({ player: ctx.player, ownerDiscordId: ctx.message.author.id, tavern }));
  },
};
