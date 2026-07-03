import type { ButtonHandler, ModalHandler } from '../../../../../discord/types.js';

import { playCoinFlipButtonHandler } from './play-coin-flip-button.js';
import { submitBetAmountModalHandler } from './submit-bet-amount-modal.js';

export const coinFlipButtonHandlers: Array<ButtonHandler> = [playCoinFlipButtonHandler];
export const coinFlipModalHandlers: Array<ModalHandler> = [submitBetAmountModalHandler];
