import type { TavernGameId } from '@one-piece/db';
import type { ButtonInteraction } from 'discord.js';

import type { ButtonHandler, ModalHandler } from '../../../discord/types.js';

export type TavernGame = {
  id: TavernGameId;
  label: string;
  emoji: string;
  open: (params: { interaction: ButtonInteraction; ownerDiscordId: string; playerId: number }) => Promise<void>;
  buttonHandlers?: Array<ButtonHandler>;
  modalHandlers?: Array<ModalHandler>;
};
