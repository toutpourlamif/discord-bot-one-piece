import type { Command } from '../../../discord/types.js';
import { getQuery } from '../../../discord/utils/get-query.js';

export const repeatCommand: Command = {
  name: 'repeat',
  async handler(message, args) {
    const text = getQuery(args, 'Tu dois fournir un texte.');
    await message.reply(text);
  },
};
