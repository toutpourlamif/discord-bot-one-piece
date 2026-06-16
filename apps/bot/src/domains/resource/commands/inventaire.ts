import type { Command } from '../../../discord/types.js';
import { resolveTargetPlayer } from '../../player/index.js';
import { buildInventoryView } from '../inventory-view.js';
import { getInventory } from '../repository.js';

export const inventaireCommand: Command = {
  names: { fr: 'inventaire', en: 'inventaire' },
  async handler(ctx) {
    const { targetPlayer } = await resolveTargetPlayer(ctx);
    const inventory = await getInventory(targetPlayer.id);

    await ctx.message.reply(buildInventoryView(targetPlayer, inventory, 0, ctx.message.author.id));
  },
};
