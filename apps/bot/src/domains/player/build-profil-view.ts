import { PLAYER_STAT_KEYS, type PlayerStatKey } from '@one-piece/db';

import type { View } from '../../discord/types.js';
import { buildMenuButtons, buildOpEmbed } from '../../discord/utils/index.js';

import { PROFIL_BUTTON_NAME } from './constants.js';
import { findByIdOrThrow } from './repository.js';
import { getStatRank } from './stats/index.js';

const STAT_FIELD_NAMES: Record<PlayerStatKey, string> = {
  karma: '⚖️ Karma',
  intelligence: '🧠 Intelligence',
  charisme: '✨ Charisme',
  volonte: '🔱 Volonté',
  audace: '🔥 Audace',
};

export async function buildProfilView(playerId: number, ownerDiscordId: string): Promise<View> {
  const player = await findByIdOrThrow(playerId);
  const navRow = buildMenuButtons(PROFIL_BUTTON_NAME, ownerDiscordId, player);
  const embed = buildOpEmbed().setTitle(`Profil de ${player.name}`);

  for (const statKey of PLAYER_STAT_KEYS) {
    const { pips, label } = getStatRank(statKey, player[statKey]);
    embed.addFields({ name: STAT_FIELD_NAMES[statKey], value: `${pips} — ${label}`, inline: true });
  }

  return { embeds: [embed], components: [navRow] };
}
