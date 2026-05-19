import type { ButtonHandler } from '../../../discord/types.js';

import { confirmSetLanguageButtonHandler } from './confirm-set-language.js';
import { confirmSetPrefixButtonHandler } from './confirm-set-prefix.js';
import { selectLanguageButtonHandler } from './language-buttons.js';

export const guildButtonHandlers: Array<ButtonHandler> = [
  confirmSetPrefixButtonHandler,
  confirmSetLanguageButtonHandler,
  selectLanguageButtonHandler,
];
