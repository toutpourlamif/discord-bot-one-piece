import type { Command } from '../../../discord/types.js';
import { getSelfUser } from '../../../discord/utils/get-self-user.js';
import { sell } from '../../economy/index.js';
import { formatBerry } from '../../economy/utils/format-berry.js';
import { findOrCreatePlayer } from '../../player/service.js';

export const sellCommand: Command = {
  name: 'sell',
  async handler(message, args) {
    const amount = BigInt(args[0] ?? '0');
    const user = getSelfUser(message);
    const { player } = await findOrCreatePlayer(user.id, user.username, message.guildId!);
    const newBerriesAmount = await sell(player.id, amount);
    await message.reply(`+${formatBerry(amount)} (solde : ${formatBerry(newBerriesAmount)})`);
  },
};
