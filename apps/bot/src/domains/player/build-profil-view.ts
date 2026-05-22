import type { View } from '../../discord/types.js';
import { buildMenuButtons, buildOpEmbed } from '../../discord/utils/index.js';
import { formatBerry } from '../economy/utils/format-berry.js';

import { PROFIL_BUTTON_NAME } from './constants.js';
import { getKarmaGrade } from './karma.js';
import { findByIdOrThrow } from './repository.js';

export async function buildProfilView(playerId: number, ownerDiscordId: string): Promise<View> {
  const navRow = buildMenuButtons(PROFIL_BUTTON_NAME, ownerDiscordId, playerId);
  const player = await findByIdOrThrow(playerId);
  const embed = buildOpEmbed()
    .setTitle(`Profil de ${player.name}`)
    .addFields(
      { name: '💰 Bounty', value: formatBerry(player.bounty), inline: true },
      { name: '⚖️ Karma', value: `${player.karma} (${getKarmaGrade(player.karma)})`, inline: true },
    );
  return { embeds: [embed], components: [navRow] };
}
