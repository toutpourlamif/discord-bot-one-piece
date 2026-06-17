import type { Command } from '../../../discord/types.js';
import { buildUpgradeShipView } from '../../ship/views/index.js';

export const upgradeShipCommand: Command = {
  names: { fr: 'upgrade-ship', en: 'upgrade-ship' },
  async handler({ message, player }) {
    await message.reply(await buildUpgradeShipView(player.id, message.author.id));
  },
};
