import type { Message, User } from 'discord.js';

/** User Discord ciblé (mentionné sinon auteur). Pour un Player (DB), utilise resolveTargetPlayer. */
export function resolveTargetUser(message: Message): User {
  return message.mentions.users.first() ?? message.author;
}
