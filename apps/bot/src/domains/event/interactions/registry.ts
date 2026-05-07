import type { ButtonHandler } from '../../../discord/types.js';

import { eventChoiceButtonHandler } from './event-choice-button.js';
import { recapShortcutButtonHandler } from './recap-shortcut-button.js';

export const eventButtonHandlers: Array<ButtonHandler> = [recapShortcutButtonHandler, eventChoiceButtonHandler];
