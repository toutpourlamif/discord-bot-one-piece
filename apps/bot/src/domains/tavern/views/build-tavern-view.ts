import { ZONE_LABELS, type Player, type TavernConfig } from '@one-piece/db';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import type { View } from '../../../discord/types.js';
import { buildCustomId, buildOpEmbed } from '../../../discord/utils/index.js';
import { buildProfilButton } from '../../player/build-profil-button.js';
import { TAVERN_SECTION_BUTTON_NAME, TAVERN_SECTIONS, type TavernSection } from '../constants.js';
import { getTavernGames } from '../games/registry.js';
import { buildTavernKeeperGreetingEmbed } from '../utils/build-tavern-keeper-greeting-embed.js';
import { getReachableTavern } from '../utils/get-reachable-tavern.js';

type BuildTavernViewParams = {
  player: Player;
  ownerDiscordId: string;
};

export function buildTavernView({ player, ownerDiscordId }: BuildTavernViewParams): View {
  const tavernConfig = getReachableTavern(player);
  if (tavernConfig === undefined) {
    const embed = buildOpEmbed().setDescription(`Il n'y a malheureusement pas de taverne à ${ZONE_LABELS[player.currentZone]}.`);
    return { embeds: [embed], components: [] };
  }

  const greetingEmbed = buildTavernKeeperGreetingEmbed(tavernConfig.tavernKeeper);

  const sectionRow = buildSectionRow(player.id, ownerDiscordId, tavernConfig);
  const navRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    buildProfilButton(ownerDiscordId, player.id, { label: 'Retourner au profil' }),
  );

  return { embeds: [greetingEmbed], components: [sectionRow, navRow] };
}

function buildSectionRow(playerId: number, ownerDiscordId: string, tavernConfig: TavernConfig): ActionRowBuilder<ButtonBuilder> {
  const sections: Array<TavernSection> = ['talk'];
  if (tavernConfig.activities.includes('shop')) sections.push('shop');
  if (tavernConfig.activities.includes('recruit')) sections.push('recruit');
  if (getTavernGames(tavernConfig.activities).length > 0) sections.push('games');

  const buttons = sections.map((section) =>
    new ButtonBuilder()
      .setCustomId(buildCustomId(TAVERN_SECTION_BUTTON_NAME, ownerDiscordId, playerId, section))
      .setLabel(TAVERN_SECTIONS[section].label)
      .setEmoji(TAVERN_SECTIONS[section].emoji)
      .setStyle(ButtonStyle.Secondary),
  );

  return new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons);
}
