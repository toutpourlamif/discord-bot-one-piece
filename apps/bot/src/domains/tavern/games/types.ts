import type { TavernGameId } from '@one-piece/db';
import type { ButtonInteraction } from 'discord.js';

import type { ButtonHandler, ModalHandler } from '../../../discord/types.js';

export type TavernGame = {
  id: TavernGameId;
  label: string;
  emoji: string;
  description: string;
  /** Ne defer PAS l'interaction : le jeu possède sa réponse (souvent un `showModal`, impossible après un defer). */
  open: (params: { interaction: ButtonInteraction; ownerDiscordId: string; playerId: number }) => Promise<void>;
  buttonHandlers?: Array<ButtonHandler>;
  modalHandlers?: Array<ModalHandler>;
};
