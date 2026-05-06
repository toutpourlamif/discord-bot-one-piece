import type { Command } from '../../../discord/types.js';
import { getKarmaGrade } from '../karma.js';

// TODO: supprimer avant la PROD - commande debug karma
export const karmaCommand: Command = {
  name: 'karma',
  async handler({ message, player }) {
    const grade = getKarmaGrade(player.karma);
    await message.reply(`Karma: ${grade} (${player.karma})`);
  },
};
