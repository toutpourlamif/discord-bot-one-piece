import { profilMenuView } from '../../../domains/player/profil-menu-view.js';
import { shipMenuView } from '../../../domains/ship/ship-menu-view.js';
import { DISCORD_ACTION_ROW_MAX_BUTTONS } from '../../constants.js';

import type { MenuView } from './types.js';

export const allMenuViews = [profilMenuView, shipMenuView];

if (allMenuViews.length > DISCORD_ACTION_ROW_MAX_BUTTONS) {
  throw new Error('Le menu est trop grand.');
}

export type MenuViewKey = (typeof allMenuViews)[number]['key'];

export const viewsByKey = new Map<MenuViewKey, MenuView>(allMenuViews.map((v) => [v.key, v]));
