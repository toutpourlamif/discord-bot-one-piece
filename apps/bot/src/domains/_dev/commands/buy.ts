import type { Command } from '../../../discord/types.js';
import { buy } from '../../economy/index.js';
import { formatBerry } from '../../economy/utils/format-berry.js';
import { findOrCreatePlayer } from '../../player/service.js';

export const buyCommand: Command = {
  name: 'buy',
  async handler(message, args) {
    const amount = BigInt(args[0] ?? '0');
    const { player } = await findOrCreatePlayer(message.author.id, message.author.username);
    await buy(player.id, amount);
    await message.reply(`-${formatBerry(amount)} (solde : ${formatBerry(player.berries - amount)}฿)`);
  },
};
