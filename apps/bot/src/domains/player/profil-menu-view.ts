import type { EmbedBuilder } from 'discord.js';

import { createOpEmbed } from '../../discord/embed/create-op-embed.js';
import type { MenuView } from '../../discord/menu/views/index.js';
import { formatBerry } from '../economy/utils/format-berry.js';

import { getKarmaGrade } from './karma.js';
import { findById } from './repository.js';

async function build(playerId: number): Promise<EmbedBuilder> {
  const player = await findById(playerId);
  if (!player) {
    return createOpEmbed().setDescription('Joueur introuvable.');
  }
  return createOpEmbed()
    .setTitle(`Profil de ${player.name}`)
    .addFields(
      { name: '💰 Bounty', value: formatBerry(player.bounty), inline: true },
      { name: '⚖️ Karma', value: `${player.karma} (${getKarmaGrade(player.karma)})`, inline: true },
    );
}

export const profilMenuView = {
  key: 'profil',
  label: 'Profil',
  emoji: '👤',
  build,
} as const satisfies MenuView;
