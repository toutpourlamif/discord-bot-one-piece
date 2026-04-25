import type { ButtonHandler } from '../../../discord/types.js';

import { profilButtonHandler } from './profil-button.js';

export const playerButtonHandlers: Array<ButtonHandler> = [profilButtonHandler];
