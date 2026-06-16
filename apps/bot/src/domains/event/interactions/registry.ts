import type { ButtonHandler } from '../../../discord/types.js';

import { eventChoiceButtonHandler } from './event-choice-button.js';
import { eventConsequenceButtonHandler } from './event-consequence-button.js';
import { eventNextButtonHandler } from './event-next-button.js';
import { recapShortcutButtonHandler } from './recap-shortcut-button.js';

export const eventButtonHandlers: Array<ButtonHandler> = [
  recapShortcutButtonHandler,
  eventChoiceButtonHandler,
  eventConsequenceButtonHandler,
  eventNextButtonHandler,
];
