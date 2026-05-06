import type { Command } from '../../../discord/types.js';
import { buildUpgradeShipView } from '../../ship/views/build-upgrade-ship-view.js';

export const upgradeShipCommand: Command = {
  name: 'upgrade-ship',
  async handler({ message, player }) {
    await message.reply(await buildUpgradeShipView(player.id, message.author.id));
  },
};
