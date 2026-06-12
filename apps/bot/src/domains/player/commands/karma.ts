import type { Command } from '../../../discord/types.js';
import { getKarmaGrade } from '../karma.js';
import { translations } from '../translations.js';

// TODO: supprimer avant la PROD - commande debug karma
export const karmaCommand: Command = {
  name: 'karma',
  async handler({ message, guild, player }) {
    const grade = getKarmaGrade(player.karma);
    await message.reply(translations.karma[guild.language](grade, player.karma));
  },
};
