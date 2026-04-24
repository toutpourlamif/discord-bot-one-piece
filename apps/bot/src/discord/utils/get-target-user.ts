import type { Message, User } from 'discord.js';

/** Si quelqu'un est mentionné, on le prend ; sinon on prend l'auteur du message. */
export function getTargetUser(message: Message): User {
  return message.mentions.users.first() ?? message.author;
}
