import type { Guild, Player } from '@one-piece/db';
import type { ActionRowBuilder, ButtonBuilder, ButtonInteraction, EmbedBuilder, Message } from 'discord.js';

export type CommandName = string | Array<string>;

export type CommandContext = {
  message: Message;
  args: Array<string>;
  player: Player;
  guild: Guild;
};

export type Command = {
  name: CommandName;
  handler: (ctx: CommandContext) => Promise<void>;
  requiresSynchronization?: boolean;
  requiresAdmin?: boolean;
};

export type ButtonHandler = {
  name: string;
  handle: (interaction: ButtonInteraction, args: Array<string>) => Promise<void>;
};

export type View = {
  embeds: Array<EmbedBuilder>;
  components: Array<ActionRowBuilder<ButtonBuilder>>;
};
