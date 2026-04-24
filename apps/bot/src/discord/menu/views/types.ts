import type { EmbedBuilder } from 'discord.js';

export type MenuView = {
  /** Identifiant UNIQUE qui permet de retrouver cette vue via une interaction */
  key: string;
  label: string;
  emoji?: string;
  /** Construit l'embed de la vue à partir du playerId. */
  build: (playerId: number) => Promise<EmbedBuilder>;
};
