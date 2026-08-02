import type { Command } from '../../../discord/types.js';
import { parseBigintArg } from '../../../discord/utils/index.js';
import { sell } from '../../economy/index.js';
import { formatBerry } from '../../economy/utils/format-berry.js';

export const sellCommand: Command = {
  names: { fr: 'sell', en: 'sell' },
  async handler({ message, args, player }) {
    const amount = parseBigintArg(args[0]);
    const newBerriesAmount = await sell(player.id, amount);
    await message.reply(`+${formatBerry(amount)} (solde : ${formatBerry(newBerriesAmount)})`);
  },
};
