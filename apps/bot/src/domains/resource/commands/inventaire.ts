import type { Command } from '../../../discord/types.js';
import { getTargetUser } from '../../../discord/utils/index.js';
import { findOrCreatePlayer } from '../../player/service.js';
import { buildInventoryView } from '../inventory-view.js';
import { getInventory } from '../repository.js';

export const inventaireCommand: Command = {
  name: 'inventaire',
  async handler({ message }) {
    const target = getTargetUser(message);
    const { player: targetPlayer } = await findOrCreatePlayer(target.id, target.username, message.guildId!);
    const inventory = await getInventory(targetPlayer.id);

    await message.reply(buildInventoryView(targetPlayer, inventory, 0, message.author.id));
  },
};
