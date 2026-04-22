import type { Message } from 'discord.js';

export type Command = {
  name: string;
  handler: (message: Message, args: Array<string>) => Promise<void>;
};
