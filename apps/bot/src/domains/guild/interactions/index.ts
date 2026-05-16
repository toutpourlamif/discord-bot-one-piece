import type { ButtonHandler } from '../../../discord/types.js';

import { cancelSetLanguageButtonHandler } from './cancel-set-language.js';
import { cancelSetPrefixButtonHandler } from './cancel-set-prefix.js';
import { confirmSetLanguageButtonHandler } from './confirm-set-language.js';
import { confirmSetPrefixButtonHandler } from './confirm-set-prefix.js';

export const guildButtonHandlers: Array<ButtonHandler> = [
  confirmSetPrefixButtonHandler,
  cancelSetPrefixButtonHandler,
  cancelSetLanguageButtonHandler,
  confirmSetLanguageButtonHandler,
];
