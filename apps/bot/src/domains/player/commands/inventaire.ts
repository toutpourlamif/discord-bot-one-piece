import type { Command } from '../../../discord/types.js';
import { getTargetUser } from '../../../discord/utils/get-target-user.js';
import { buildInventoryView } from '../inventory-view.js';
import { findInventoryByPlayerId } from '../repository.js';
import { findOrCreatePlayer } from '../service.js';

export const inventaireCommand: Command = {
  name: 'inventaire',
  async handler(message) {
    const target = getTargetUser(message);
    const { player } = await findOrCreatePlayer(target.id, target.username);
    const resources = await findInventoryByPlayerId(player.id);

    await message.reply({
      ...buildInventoryView(player, resources, 0),
      allowedMentions: { parse: [] },
    });
  },
};
