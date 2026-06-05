import type { Command } from '../../../discord/types.js';
import { getCrewMoraleGrade } from '../../crew/crew-morale.js';
import { texts } from '../texts.js';

// TODO: supprimer avant la PROD - commande debug crew morale
export const crewMoraleCommand: Command = {
  name: ['crew-morale', 'crewmorale', 'morale'],
  async handler({ message, guild, player }) {
    const grade = getCrewMoraleGrade(player.crewMorale);
    await message.reply(texts.crewMorale[guild.language](grade, player.crewMorale));
  },
};
