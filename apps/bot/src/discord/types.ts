import type { ActionRowBuilder, ButtonBuilder, ButtonInteraction, EmbedBuilder, Message } from 'discord.js';

export type Command = {
  name: string;
  handler: (message: Message, args: Array<string>) => Promise<void>;
};

export type ButtonHandler = {
  name: string;
  handle: (interaction: ButtonInteraction, args: Array<string>) => Promise<void>;
};

export type View = {
  embeds: Array<EmbedBuilder>;
  components: Array<ActionRowBuilder<ButtonBuilder>>;
};
