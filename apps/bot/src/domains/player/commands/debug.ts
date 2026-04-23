import type { Command } from '../../../shared/command.js';
import { wrapInCodeBlock } from '../../../shared/helpers.js';
import { findOrCreatePlayer } from '../service.js';

// TODO: supprimer en prod
export const debugCommand: Command = {
  name: 'debug',
  async handler(message) {
    const target = message.mentions.users.first() ?? message.author;
    const { player, created } = await findOrCreatePlayer(target.id, target.username);

    const status = created ? '🆕 Player créé' : '✅ Player existant';
    const stringifiablePlayer = { ...player, bounty: player.bounty.toString() };
    const playerAsJsonString = JSON.stringify(stringifiablePlayer, null, 2);
    const codeBlock = wrapInCodeBlock(playerAsJsonString, 'json');

    await message.reply(`${status}\n${codeBlock}`);
  },
};
