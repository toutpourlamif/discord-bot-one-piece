import { ZONE_LABELS, type Player } from '@one-piece/db';
import type { APIEmbedField } from 'discord.js';

import type { View } from '../../discord/types.js';
import { buildDiscordTimestamp, buildMenuButtons, buildOpEmbed } from '../../discord/utils/index.js';
import { getCrewDisplayName } from '../crew/utils/get-crew-display-name.js';
import { formatBerry } from '../economy/utils/format-berry.js';
import { getStartDateOfBucket } from '../event/engine/bucket.js';

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
      { name: '🏴‍☠️ Équipage', value: getCrewDisplayName(player), inline: true },
      ...buildLocationFields(player),
    );
  return { embeds: [embed], components: [navRow] };
}

function buildLocationFields(player: Player): Array<APIEmbedField> {
  const positionField: APIEmbedField = { name: '📍 Position', value: ZONE_LABELS[player.currentZone], inline: true };
  if (player.travelTargetZone === null || player.travelEtaBucket === null) {
    return [positionField];
  }
  const arrivalAt = getStartDateOfBucket(player.travelEtaBucket);
  return [
    positionField,
    {
      name: '🚢 Destination',
      value: `${ZONE_LABELS[player.travelTargetZone]}(~${buildDiscordTimestamp(arrivalAt)})`,
      inline: true,
    },
  ];
}
