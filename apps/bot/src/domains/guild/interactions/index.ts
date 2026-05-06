import type { ButtonHandler } from '../../../discord/types.js';

import { cancelSetPrefixButtonHandler, confirmSetPrefixButtonHandler } from './set-prefix.js';

export const guildButtonHandlers: Array<ButtonHandler> = [confirmSetPrefixButtonHandler, cancelSetPrefixButtonHandler];
