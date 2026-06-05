import type { Command } from '../../../discord/types.js';
import { getKarmaGrade } from '../karma.js';
import { texts } from '../texts.js';

// TODO: supprimer avant la PROD - commande debug karma
export const karmaCommand: Command = {
  name: 'karma',
  async handler({ message, guild, player }) {
    const grade = getKarmaGrade(player.karma);
    await message.reply(texts.karma[guild.language](grade, player.karma));
  },
};
