import type { ModalHandler } from '../../../../../discord/types.js';

import { submitBetAmountModalHandler } from './submit-bet-amount-modal.js';

export const coinFlipModalHandlers: Array<ModalHandler> = [submitBetAmountModalHandler];
