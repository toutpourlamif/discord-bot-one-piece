import type { Command } from '../../../discord/types.js';

export const onePieceCommand: Command = {
  name: 'onepiece',
  async handler({ message }) {
    await message.reply('hello everyone');
  },
};
