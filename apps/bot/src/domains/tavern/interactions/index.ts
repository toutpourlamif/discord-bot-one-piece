import type { ButtonHandler, ModalHandler } from '../../../discord/types.js';
import { tavernGameButtonHandlers, tavernGameModalHandlers } from '../games/index.js';

import { tavernButtonHandler } from './tavern-button.js';
import { tavernSectionButtonHandler } from './tavern-section-button.js';

export const tavernButtonHandlers: Array<ButtonHandler> = [tavernButtonHandler, tavernSectionButtonHandler, ...tavernGameButtonHandlers];
export const tavernModalHandlers: Array<ModalHandler> = [...tavernGameModalHandlers];
