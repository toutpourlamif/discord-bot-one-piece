import { SHIP_MODULE_KEYS, SHIP_MODULE_LEVEL_COLUMNS, type ShipModuleKey } from '@one-piece/db';

import type { View } from '../../discord/types.js';
import { buildMenuButtons, buildOpEmbed } from '../../discord/utils/index.js';

import { SHIP_BUTTON_NAME } from './constants.js';
import { SHIP_MODULES } from './modules.js';
import { findByPlayerIdOrThrow } from './repository.js';

const MODULE_LABELS: Record<ShipModuleKey, string> = {
  hull: 'Coque',
  sail: 'Voile',
  decks: 'Ponts',
  cabins: 'Chambres',
  cargo: 'Cale',
};

export async function buildShipView(playerId: number): Promise<View> {
  const navRow = buildMenuButtons(SHIP_BUTTON_NAME, playerId);
  const ship = await findByPlayerIdOrThrow(playerId);
  const embed = buildOpEmbed().setTitle(`🚢 ${ship.name}`).setDescription(`HP : ${ship.hp}`);
  // TODO: Redesign this shit
  for (const key of SHIP_MODULE_KEYS) {
    const level = ship[SHIP_MODULE_LEVEL_COLUMNS[key]];
    const value = SHIP_MODULES[key].valueByLevel[level - 1];
    embed.addFields({
      name: `${MODULE_LABELS[key]} (niveau ${level})`,
      value: value !== undefined ? String(value) : '—',
      inline: true,
    });
  }
  return { embeds: [embed], components: [navRow] };
}
