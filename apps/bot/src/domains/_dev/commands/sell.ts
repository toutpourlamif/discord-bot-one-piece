import type { Command } from '../../../discord/types.js';
import { sell } from '../../economy/index.js';
import { formatBerry } from '../../economy/utils/format-berry.js';

export const sellCommand: Command = {
  name: 'sell',
  async handler({ message, args, player }) {
    const amount = BigInt(args[0] ?? '0');
    const newBerriesAmount = await sell(player.id, amount);
    await message.reply(`+${formatBerry(amount)} (solde : ${formatBerry(newBerriesAmount)})`);
  },
};
