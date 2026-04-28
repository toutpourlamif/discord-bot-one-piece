import type { Command } from '../../../discord/types.js';
import { buy, InsufficientFundsError } from '../../economy/index.js';
import { formatBerry } from '../../economy/utils/format-berry.js';
import { findOrCreatePlayer } from '../../player/service.js';

export const buyCommand: Command = {
  name: 'buy',
  async handler(message, args) {
    console.log('buy command called', args);

    const amount = BigInt(args[0] ?? '0');
    const { player } = await findOrCreatePlayer(message.author.id, message.author.username);
    try {
      await buy(player.id, amount);
      await message.reply(`-${formatBerry(amount)} (solde : ${formatBerry(player.berries - amount)}฿)`);
    } catch (e) {
      console.error('buy error:', e);
      if (e instanceof InsufficientFundsError) {
        await message.reply('Pas assez de berry.');
      } else {
        await message.reply('Une erreur est survenue.');
      }
    }
  },
};
