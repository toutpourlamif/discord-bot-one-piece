import type { Command } from '../../../discord/types.js';
import { getQuery } from '../../../discord/utils/get-query.js';

export const repeatCommand: Command = {
  name: { fr: 'repeat', en: 'repeat' },
  async handler({ message, args }) {
    const text = getQuery(args, { emptyMessage: 'Tu dois fournir un texte.' });
    await message.reply(text);
  },
};
