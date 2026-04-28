import type { ButtonHandler } from '../../../discord/types.js';

import { charactersPaginationButtonHandler } from './characters-pagination.js';
import { setCaptainButtonHandler } from './set-captain.js';

export const characterButtonHandlers: Array<ButtonHandler> = [charactersPaginationButtonHandler, setCaptainButtonHandler];
