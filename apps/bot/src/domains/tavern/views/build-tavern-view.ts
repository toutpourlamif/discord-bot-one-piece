import { ZONE_LABELS, type Player, type TavernConfig } from '@one-piece/db';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import type { View } from '../../../discord/types.js';
import { buildBackAction, buildCustomId, buildOpEmbed } from '../../../discord/utils/index.js';
import { PROFIL_BUTTON_NAME } from '../../player/constants.js';
import { TAVERN_SECTION_BUTTON_NAME, TAVERN_SECTIONS, type TavernSection } from '../constants.js';
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

  const embed = buildOpEmbed()
    .setTitle(`🍺 Taverne — ${ZONE_LABELS[player.currentZone]}`)
    .setDescription("Pousse la porte : un verre, une partie, du recrutement et de quoi t'équiper.");

  const sectionRow = buildSectionRow(player.id, ownerDiscordId, tavernConfig);
  const navRow = buildBackAction(buildCustomId(PROFIL_BUTTON_NAME, ownerDiscordId, player.id));

  return { embeds: [embed], components: [sectionRow, navRow] };
}

function buildSectionRow(playerId: number, ownerDiscordId: string, tavernConfig: TavernConfig): ActionRowBuilder<ButtonBuilder> {
  const sections: Array<TavernSection> = ['barkeep'];
  if (tavernConfig.activities.includes('shop')) sections.push('shop');
  if (tavernConfig.activities.includes('recruit')) sections.push('recruit');
  if (tavernConfig.activities.includes('blackjack') || tavernConfig.activities.includes('juste-prix')) sections.push('games');

  const buttons = sections.map((section) =>
    new ButtonBuilder()
      .setCustomId(buildCustomId(TAVERN_SECTION_BUTTON_NAME, ownerDiscordId, playerId, section))
      .setLabel(TAVERN_SECTIONS[section].label)
      .setEmoji(TAVERN_SECTIONS[section].emoji)
      .setStyle(ButtonStyle.Secondary),
  );

  return new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons);
}
