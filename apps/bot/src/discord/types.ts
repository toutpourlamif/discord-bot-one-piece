import type { Player } from '@one-piece/db';
import type { ActionRowBuilder, ButtonBuilder, ButtonInteraction, EmbedBuilder, Message } from 'discord.js';

export type CommandName = string | Array<string>;

export type CommandContext = {
  message: Message;
  args: Array<string>;
  player: Player;
};

export type Command = {
  name: CommandName;
  handler: (ctx: CommandContext) => Promise<void>;
  requiresSynchronization?: boolean; // défaut : true (cf #189)
  adminOnly?: boolean; // défaut : false
};

export type ButtonHandler = {
  name: string;
  handle: (interaction: ButtonInteraction, args: Array<string>) => Promise<void>;
};

export type View = {
  embeds: Array<EmbedBuilder>;
  components: Array<ActionRowBuilder<ButtonBuilder>>;
};
