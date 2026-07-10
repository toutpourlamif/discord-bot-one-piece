import type { TavernKeeper } from '@one-piece/db';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

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

// TODO: vraies répliques du tavernier + angry a ajouté
const KEEPER_WIN_REACTION = 'Rrah… la chance était avec toi cette fois. Profites-en.';
const KEEPER_LOSS_REACTION = 'Hahaha ! La maison gagne toujours, mon petit.';

export function buildCoinFlipResultView({ outcome, tavernKeeper, ownerDiscordId, playerId }: BuildCoinFlipResultViewParams): View {
  const dialogueSpeaker = buildTavernKeeperDialogueSpeaker(tavernKeeper);
  const keeperReaction = outcome.hasWon ? KEEPER_WIN_REACTION : KEEPER_LOSS_REACTION;
  const reactionText = `La pièce retombe sur **${formatSide(outcome.revealedSide)}**. ${keeperReaction}`;

  const balanceDeltaLabel = outcome.hasWon ? `+${formatBerry(outcome.balanceDelta)}` : `-${formatBerry(-outcome.balanceDelta)}`;
  const embed = buildDialogueEmbed(dialogueSpeaker, reactionText, { emotion: outcome.hasWon ? 'angry' : 'happy' }).setFooter({
    text: `Nouveau solde : ${formatBerry(outcome.newBalance)} (${balanceDeltaLabel})`,
  });

  const replayButton = new ButtonBuilder()
    .setCustomId(buildCustomId(TAVERN_GAME_BUTTON_NAME, ownerDiscordId, playerId, COIN_FLIP_GAME_ID))
    .setLabel('Rejouer')
    .setEmoji('🔁')
    .setStyle(ButtonStyle.Primary);
  const backButton = new ButtonBuilder()
    .setCustomId(buildCustomId(TAVERN_SECTION_BUTTON_NAME, ownerDiscordId, playerId, 'games'))
    .setLabel(TAVERN_SECTIONS.games.label)
    .setEmoji(TAVERN_SECTIONS.games.emoji)
    .setStyle(ButtonStyle.Secondary);

  const actionsRow = new ActionRowBuilder<ButtonBuilder>().addComponents(replayButton, backButton);

  return { embeds: [embed], components: [actionsRow] };
}

function formatSide(side: CoinSide): string {
  const { label, emoji } = COIN_SIDES[side];
  return `${label} ${emoji}`;
}
