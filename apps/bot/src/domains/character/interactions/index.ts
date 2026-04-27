import type { ButtonHandler } from '../../../discord/types.js';

import { charactersPaginationButtonHandler } from './characters-pagination.js';

export const characterButtonHandlers: Array<ButtonHandler> = [charactersPaginationButtonHandler];
