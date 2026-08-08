import type { Command } from '../../../discord/types.js';
import { getStatRank } from '../stats/index.js';
import { translations } from '../translations.js';

// TODO: supprimer avant la PROD - commande debug karma
export const karmaCommand: Command = {
  names: { fr: 'karma', en: 'karma' },
  async handler({ message, guild, player }) {
    const { pips, label } = getStatRank('karma', player.karma);
    await message.reply(translations.karma[guild.language](`${pips} ${label}`, player.karma));
  },
};
