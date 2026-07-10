import type { TavernGame } from '../types.js';

import { COIN_FLIP_GAME_ID, COIN_SIDES } from './constants.js';
import { coinFlipModalHandlers } from './interactions/index.js';
import { openCoinFlipBetModal } from './open-coin-flip-bet-modal.js';

export const coinFlipGame: TavernGame = {
  id: COIN_FLIP_GAME_ID,
  label: 'Pile ou Face',
  emoji: COIN_SIDES.heads.emoji,
  open: openCoinFlipBetModal,
  modalHandlers: coinFlipModalHandlers,
};
