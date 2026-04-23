import type { ButtonInteraction } from 'discord.js';

export type ButtonHandler = {
  customIdPrefix: string;
  handle: (interaction: ButtonInteraction) => Promise<void>;
};
