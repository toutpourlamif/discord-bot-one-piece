import type { Command } from '../../../discord/types.js';
import { getTargetUser } from '../../../discord/utils/get-target-user.js';
import { findOrCreatePlayer } from '../../player/service.js';
import { buildInventoryView } from '../inventory-view.js';
import { getInventory } from '../repository.js';

export const inventaireCommand: Command = {
  name: 'inventaire',
  async handler(message) {
    const target = getTargetUser(message);
    const { player } = await findOrCreatePlayer(target.id, target.username);
    const inventory = await getInventory(player.id);

    await message.reply(buildInventoryView(player, inventory, 0));
  },
};
