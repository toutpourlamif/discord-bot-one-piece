import type { Message, User } from 'discord.js';

export function getSelfUser(message: Message): User {
  return message.author;
}
