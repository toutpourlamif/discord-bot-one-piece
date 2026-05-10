import type { Command } from '../../../discord/types.js';
import { getCrewMoraleGrade } from '../../crew/crewMorale.js';

// TODO: supprimer avant la PROD - commande debug crew morale
export const crewMoraleCommand: Command = {
  name: ['crew-morale', 'crewmorale'],
  async handler({ message, player }) {
    const grade = getCrewMoraleGrade(player.crewMorale);
    await message.reply(`Morale d'équipage: ${grade} (${player.crewMorale})`);
  },
};
