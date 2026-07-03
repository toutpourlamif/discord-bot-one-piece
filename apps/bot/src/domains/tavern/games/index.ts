import type { ButtonHandler, ModalHandler } from '../../../discord/types.js';

import { openTavernGameButtonHandler } from './open-tavern-game-button.js';
import { TAVERN_GAMES } from './registry.js';

export const tavernGameButtonHandlers: Array<ButtonHandler> = [
  openTavernGameButtonHandler,
  ...TAVERN_GAMES.flatMap((tavernGame) => tavernGame.buttonHandlers ?? []),
];

export const tavernGameModalHandlers: Array<ModalHandler> = TAVERN_GAMES.flatMap((tavernGame) => tavernGame.modalHandlers ?? []);
