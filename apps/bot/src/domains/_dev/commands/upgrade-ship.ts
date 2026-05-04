import type { Command } from '../../../discord/types.js';
import { getSelfUser } from '../../../discord/utils/get-self-user.js';
import { findOrCreatePlayer } from '../../player/service.js';
import { buildUpgradeShipView } from '../../ship/build-upgrade-ship-view.js';

export const upgradeShipCommand: Command = {
  name: 'upgrade-ship',
  async handler(message) {
    const user = getSelfUser(message);
    const { player } = await findOrCreatePlayer(user.id, user.username);
    await message.reply(await buildUpgradeShipView(player.id, user.id));
  },
};
