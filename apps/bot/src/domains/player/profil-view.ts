import type { View } from '../../discord/types.js';
import { buildMenuButtons } from '../../discord/utils/build-menu-buttons.js';
import { buildOpEmbed } from '../../discord/utils/build-op-embed.js';
import { formatBerry } from '../economy/utils/format-berry.js';

import { PROFIL_BUTTON_NAME } from './constants.js';
import { getKarmaGrade } from './karma.js';
import { findByIdOrThrow } from './repository.js';

export async function buildProfilView(playerId: number): Promise<View> {
  const navRow = buildMenuButtons(PROFIL_BUTTON_NAME, playerId);
  // TODO: AJOUTER UTIL qui valide les ID
  const player = await findByIdOrThrow(playerId);
  const embed = buildOpEmbed()
    .setTitle(`Profil de ${player.name}`)
    .addFields(
      { name: '💰 Bounty', value: formatBerry(player.bounty), inline: true },
      { name: '⚖️ Karma', value: `${player.karma} (${getKarmaGrade(player.karma)})`, inline: true },
    );
  return { embeds: [embed], components: [navRow] };
}
