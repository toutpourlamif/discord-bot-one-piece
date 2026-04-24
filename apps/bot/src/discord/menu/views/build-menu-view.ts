import { buildNavigationRow } from '../buttons/build-navigation-row.js';

import { type MenuViewKey, viewsByKey } from './registry.js';

export async function buildMenuView(key: MenuViewKey, playerId: number) {
  const view = viewsByKey.get(key);
  if (!view) throw new Error(`Vue inconnue : ${key}`);
  const embed = await view.build(playerId);
  return { embeds: [embed], components: [buildNavigationRow(key, playerId)] };
}
