import type { ButtonHandler } from '../../../discord/types.js';

import { crewPaginationButtonHandler } from './crew-pagination.js';
import { setCaptainButtonHandler } from './set-captain.js';

export const crewButtonHandlers: Array<ButtonHandler> = [crewPaginationButtonHandler, setCaptainButtonHandler];
