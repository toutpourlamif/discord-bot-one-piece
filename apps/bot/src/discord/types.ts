import type { Guild, Player, SupportedLanguage } from '@one-piece/db';
import type { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonInteraction, EmbedBuilder, Message } from 'discord.js';

type CommandNames = Record<SupportedLanguage, string>;

export type CommandContext = {
  message: Message;
  args: Array<string>;
  player: Player;
  guild: Guild;
};

export type Command = {
  names: CommandNames;
  aliases?: CommandNames;
  handler: (ctx: CommandContext) => Promise<void>;
  requiresSynchronization?: boolean;
  requiresOpAdmin?: boolean;
  requiresOnboardingFinished?: boolean;
};

export type ButtonHandler = {
  name: string;
  handle: (interaction: ButtonInteraction, args: Array<string>) => Promise<void>;
};

export type View = {
  embeds: Array<EmbedBuilder>;
  components: Array<ActionRowBuilder<ButtonBuilder>>;
  files?: Array<AttachmentBuilder>;
};
