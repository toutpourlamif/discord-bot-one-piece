import type { ButtonHandler } from '../../../discord/types.js';

import { recapShortcutButtonHandler } from './recap-shortcut-button.js';

export const eventButtonHandlers: Array<ButtonHandler> = [recapShortcutButtonHandler];
