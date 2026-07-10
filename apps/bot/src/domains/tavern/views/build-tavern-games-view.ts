import type { TavernConfig } from '@one-piece/db';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import type { View } from '../../../discord/types.js';
import { buildBackAction, buildCustomId, buildDialogueEmbed } from '../../../discord/utils/index.js';
import { TAVERN_BUTTON_NAME, TAVERN_GAME_BUTTON_NAME } from '../constants.js';
import { getTavernGames } from '../games/registry.js';
import type { TavernGame } from '../games/types.js';
import { buildTavernKeeperDialogueSpeaker } from '../utils/build-tavern-keeper-dialogue-speaker.js';

type BuildTavernGamesViewParams = {
  tavernConfig: TavernConfig;
  ownerDiscordId: string;
  playerId: number;
};

export function buildTavernGamesView({ tavernConfig, ownerDiscordId, playerId }: BuildTavernGamesViewParams): View {
  const tavernGames = getTavernGames(tavernConfig.activities);
  const dialogueSpeaker = buildTavernKeeperDialogueSpeaker(tavernConfig.tavernKeeper);

  const backRow = buildBackAction(buildCustomId(TAVERN_BUTTON_NAME, ownerDiscordId, playerId));

  if (tavernGames.length === 0) {
    const emptyEmbed = buildDialogueEmbed(dialogueSpeaker, "Désolé, aucun jeu n'est disponible ici pour l'instant.");
    return { embeds: [emptyEmbed], components: [backRow] };
  }

  const embed = buildDialogueEmbed(dialogueSpeaker, 'À quel jeu veux-tu jouer ?');
  const tavernGameButtons = tavernGames.map((tavernGame) => buildTavernGameButton(tavernGame, ownerDiscordId, playerId));
  const tavernGamesRow = new ActionRowBuilder<ButtonBuilder>().addComponents(...tavernGameButtons);

  return { embeds: [embed], components: [tavernGamesRow, backRow] };
}

function buildTavernGameButton(tavernGame: TavernGame, ownerDiscordId: string, playerId: number): ButtonBuilder {
  const customId = buildCustomId(TAVERN_GAME_BUTTON_NAME, ownerDiscordId, playerId, tavernGame.id);

  return new ButtonBuilder().setCustomId(customId).setLabel(tavernGame.label).setEmoji(tavernGame.emoji).setStyle(ButtonStyle.Primary);
}
