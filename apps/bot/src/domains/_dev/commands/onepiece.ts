import type { Command } from '../../../discord/types.js';

export const onePieceCommand: Command = {
  name: { fr: 'onepiece', en: 'onepiece' },
  async handler({ message }) {
    await message.reply('hello everyone');
  },
};
