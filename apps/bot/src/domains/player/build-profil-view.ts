import type { View } from '../../discord/types.js';
import { buildMenuButtons, buildOpEmbed } from '../../discord/utils/index.js';

import { PROFIL_BUTTON_NAME } from './constants.js';
import { getKarmaGrade } from './karma.js';
import { findByIdOrThrow } from './repository.js';

export async function buildProfilView(playerId: number, ownerDiscordId: string): Promise<View> {
  const player = await findByIdOrThrow(playerId);
  const navRow = buildMenuButtons(PROFIL_BUTTON_NAME, ownerDiscordId, player);
  const embed = buildOpEmbed()
    .setTitle(`Profil de ${player.name}`)
    .addFields({ name: '⚖️ Karma', value: `${player.karma} (${getKarmaGrade(player.karma)})`, inline: true });
  return { embeds: [embed], components: [navRow] };
}
