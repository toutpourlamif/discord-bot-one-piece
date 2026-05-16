import type { ButtonHandler } from '../../../discord/types.js';

import { cancelSetPrefixButtonHandler } from './cancel-set-prefix.js';
import { confirmSetPrefixButtonHandler } from './confirm-set-prefix.js';

export const guildButtonHandlers: Array<ButtonHandler> = [confirmSetPrefixButtonHandler, cancelSetPrefixButtonHandler];
