import type { Command } from '../../../discord/types.js';
import { getCrewMoraleGrade } from '../../crew/crew-morale.js';

// TODO: supprimer avant la PROD - commande debug crew morale
export const crewMoraleCommand: Command = {
  name: ['crew-morale', 'crewmorale', 'morale'],
  async handler({ message, player }) {
    const grade = getCrewMoraleGrade(player.crewMorale);
    await message.reply(`Morale d'équipage: ${grade} (${player.crewMorale})`);
  },
};
