import type { ButtonInteraction, Message } from 'discord.js';

export type Command = {
  name: string;
  handler: (message: Message, args: Array<string>) => Promise<void>;
};

export type ButtonHandler = {
  customIdPrefix: string;
  handle: (interaction: ButtonInteraction) => Promise<void>;
};
