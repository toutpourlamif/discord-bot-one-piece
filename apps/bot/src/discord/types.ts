import type { ActionRowBuilder, ButtonBuilder, ButtonInteraction, EmbedBuilder, Message } from 'discord.js';

export type CommandName = string | Array<string>;

export type Command = {
  name: CommandName;
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
