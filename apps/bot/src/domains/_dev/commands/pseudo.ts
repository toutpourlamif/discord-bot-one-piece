import type { Command } from '../../../discord/types.js';
import { getTargetUser } from '../../../discord/utils/get-target-user.js';

export const pseudoCommand: Command = {
  name: 'pseudo',
  async handler({ message }) {
    const user = getTargetUser(message);
    await message.reply(`Le pseudo est : ${user.username}`);
  },
};
