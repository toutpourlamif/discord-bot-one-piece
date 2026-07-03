import type { Guild, Player, SupportedLanguage } from '@one-piece/db';
import type {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonInteraction,
  EmbedBuilder,
  Message,
  ModalSubmitInteraction,
} from 'discord.js';

type CommandNames = Record<SupportedLanguage, string>;
type CommandAliases = Record<SupportedLanguage, Array<string>>;

export type CommandContext = {
  message: Message;
  args: Array<string>;
  player: Player;
  guild: Guild;
};

export type Command = {
  names: CommandNames;
  aliases?: CommandAliases;
  handler: (ctx: CommandContext) => Promise<void>;
  requiresSynchronization?: boolean;
  requiresOpAdmin?: boolean;
  requiresOnboardingFinished?: boolean;
};

export type ButtonHandler = {
  name: string;
  handle: (interaction: ButtonInteraction, args: Array<string>) => Promise<void>;
};

export type ModalHandler = {
  name: string;
  handle: (interaction: ModalSubmitInteraction, args: Array<string>) => Promise<void>;
};

export type View = {
  embeds: Array<EmbedBuilder>;
  components: Array<ActionRowBuilder<ButtonBuilder>>;
  files?: Array<AttachmentBuilder>;
};
