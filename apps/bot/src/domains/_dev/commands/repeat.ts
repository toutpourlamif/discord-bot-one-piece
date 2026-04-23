import type { Command } from '../../../shared/command.js';

export const repeatCommand: Command = {
  name: 'repeat',
  async handler(message, args) {
    const text = args.join(' ');
    if (!text) {
      await message.reply('Tu dois fournir un texte.');
      return;
    }
    await message.reply(text);
  },
};
