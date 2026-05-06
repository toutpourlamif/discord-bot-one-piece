import type { Command } from '../../../discord/types.js';
import { buy } from '../../economy/index.js';
import { formatBerry } from '../../economy/utils/format-berry.js';

export const buyCommand: Command = {
  name: 'buy',
  async handler({ message, args, player }) {
    const amount = BigInt(args[0] ?? '0');
    const newBerriesAmount = await buy(player.id, amount);
    await message.reply(`-${formatBerry(amount)} (solde : ${formatBerry(newBerriesAmount)})`);
  },
};
