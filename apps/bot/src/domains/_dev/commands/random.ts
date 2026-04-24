import type { Command } from '../../../discord/types.js';

// TODO: SUPPRIMER EN PROD
export const randomCommand: Command = {
  name: 'random',
  async handler(message) {
    const min = 1;
    const max = 1000;
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

    await message.reply(`🎲 Nombre aléatoire (${min}-${max}) : **${randomNumber}**`);
  },
};
