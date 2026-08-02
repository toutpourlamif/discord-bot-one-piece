import type { TavernKeeper } from '@one-piece/db';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import sample from 'lodash/sample.js';

import type { View } from '../../../../../discord/types.js';
import { buildCustomId, buildDialogueEmbed } from '../../../../../discord/utils/index.js';
import { formatBerry } from '../../../../economy/index.js';
import { TAVERN_GAME_BUTTON_NAME, TAVERN_SECTION_BUTTON_NAME, TAVERN_SECTIONS } from '../../../constants.js';
import { buildTavernKeeperDialogueSpeaker } from '../../../utils/build-tavern-keeper-dialogue-speaker.js';
import { COIN_FLIP_GAME_ID, COIN_SIDES } from '../constants.js';
import type { CoinFlipOutcome, CoinSide } from '../types.js';

type BuildCoinFlipResultViewParams = {
  outcome: CoinFlipOutcome;
  tavernKeeper: TavernKeeper;
  ownerDiscordId: string;
  playerId: number;
};

// TODO: vraies répliques du tavernier
const KEEPER_WIN_REACTION = 'Rrah… la chance était avec toi cette fois. Profites-en.';
const KEEPER_LOSS_REACTION = 'Hahaha ! La maison gagne toujours, mon petit.';

/** Le barkeeper perd (le joueur gagne) : réaction dépitée, tirée au sort parmi ces émotions. */
const BARKEEPER_LOSS_EMOTIONS = ['scared', 'angry', 'crying'] as const;

export function buildCoinFlipResultView({ outcome, tavernKeeper, ownerDiscordId, playerId }: BuildCoinFlipResultViewParams): View {
  const dialogueSpeaker = buildTavernKeeperDialogueSpeaker(tavernKeeper);
  const keeperReaction = outcome.hasWon ? KEEPER_WIN_REACTION : KEEPER_LOSS_REACTION;
  const balanceDeltaLabel = outcome.hasWon ? `+${formatBerry(outcome.balanceDelta)}` : `-${formatBerry(-outcome.balanceDelta)}`;
  const reactionText = `La pièce retombe sur **${formatSide(outcome.revealedSide)}** *(${balanceDeltaLabel})*.\n${keeperReaction}`;

  const keeperEmotion = outcome.hasWon ? sample(BARKEEPER_LOSS_EMOTIONS) : 'happy';
  const embed = buildDialogueEmbed(dialogueSpeaker, reactionText, { emotion: keeperEmotion }).setFooter({
    text: `Nouveau solde : ${formatBerry(outcome.newBalance)}`,
  });

  const replayButton = new ButtonBuilder()
    .setCustomId(buildCustomId(TAVERN_GAME_BUTTON_NAME, ownerDiscordId, playerId, COIN_FLIP_GAME_ID))
    .setLabel('Rejouer')
    .setEmoji('🔁')
    .setStyle(ButtonStyle.Primary);
  const backButton = new ButtonBuilder()
    .setCustomId(buildCustomId(TAVERN_SECTION_BUTTON_NAME, ownerDiscordId, playerId, 'games'))
    .setLabel('Voir les autres jeux')
    .setEmoji(TAVERN_SECTIONS.games.emoji)
    .setStyle(ButtonStyle.Secondary);

  const actionsRow = new ActionRowBuilder<ButtonBuilder>().addComponents(replayButton, backButton);

  return { embeds: [embed], components: [actionsRow] };
}

function formatSide(side: CoinSide): string {
  const { label, emoji } = COIN_SIDES[side];
  return `${label} ${emoji}`;
}
