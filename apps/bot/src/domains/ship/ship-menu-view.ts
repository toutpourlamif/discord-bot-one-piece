import { SHIP_MODULE_KEYS, SHIP_MODULE_LEVEL_COLUMNS, type ShipModuleKey } from '@one-piece/db';
import type { EmbedBuilder } from 'discord.js';

import { createOpEmbed } from '../../discord/embed/create-op-embed.js';
import type { MenuView } from '../../discord/menu/views/index.js';

import { SHIP_MODULES } from './modules.js';
import { findByPlayerId } from './repository.js';

async function build(playerId: number): Promise<EmbedBuilder> {
  const ship = await findByPlayerId(playerId);
  if (!ship) {
    return createOpEmbed().setDescription("Ce joueur n'a pas encore de navire.");
  }
  const embed = createOpEmbed().setTitle(`🚢 ${ship.name}`).setDescription(`HP : ${ship.hp}`);
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
  return embed;
}

export const shipMenuView = {
  key: 'ship',
  label: 'Navire',
  emoji: '🚢',
  build,
} as const satisfies MenuView;

const MODULE_LABELS: Record<ShipModuleKey, string> = {
  hull: 'Coque',
  sail: 'Voile',
  decks: 'Ponts',
  cabins: 'Chambres',
  cargo: 'Cale',
};
