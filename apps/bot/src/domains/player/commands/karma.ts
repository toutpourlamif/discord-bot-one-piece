import type { Command } from '../../../discord/types.js';
import { getKarmaGrade } from '../karma.js';
import { findOrCreatePlayer } from '../service.js';

// TODO: supprimer avant la PROD - commande debug karma
export const karmaCommand: Command = {
  name: 'karma',
  async handler(message) {
    const { player } = await findOrCreatePlayer(message.author.id, message.author.username);
    const grade = getKarmaGrade(player.karma);
    await message.reply(`Karma: ${grade} (${player.karma})`);
  },
};
