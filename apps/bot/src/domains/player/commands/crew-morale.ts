import type { Command } from '../../../discord/types.js';
import { getCrewMoraleGrade } from '../../crew/crew-morale.js';
import { translations } from '../translations.js';

// TODO: supprimer avant la PROD - commande debug crew morale
export const crewMoraleCommand: Command = {
  names: { fr: 'moraleequipage', en: 'crewmorale' },
  aliases: { fr: ['morale'], en: ['morale'] },
  async handler({ message, guild, player }) {
    const grade = getCrewMoraleGrade(player.crewMorale);
    await message.reply(translations.crewMorale[guild.language](grade, player.crewMorale));
  },
};
