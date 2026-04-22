import type { Command } from '../../../shared/command.js';
import { findOrCreatePlayer } from '../service.js';

// TODO: supprimer en prod
export const debugCommand: Command = {
  name: 'debug',
  async handler(message) {
    const { player, created } = await findOrCreatePlayer(message.author.id, message.author.username);
    await message.reply(`${created ? '🆕 Player créé' : '✅ Player existant'}\n\`\`\`json\n${JSON.stringify(player, null, 2)}\n\`\`\``);
  },
};
