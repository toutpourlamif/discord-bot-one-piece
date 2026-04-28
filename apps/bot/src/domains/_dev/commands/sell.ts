import type { Command } from '../../../discord/types.js';
import { sell } from '../../economy/index.js';
import { formatBerry } from '../../economy/utils/format-berry.js';
import { findOrCreatePlayer } from '../../player/service.js';
// TODO: enlever en production, c'est juste pour tester les fonctionnalités d'achat/vente

export const sellCommand: Command = {
  name: 'sell',
  async handler(message, args) {
    const amount = BigInt(args[0] ?? '0');
    const { player } = await findOrCreatePlayer(message.author.id, message.author.username);
    await sell(player.id, amount);
    await message.reply(`+${formatBerry(amount)} (solde : ${formatBerry(player.berries + amount)}฿)`);
  },
};
