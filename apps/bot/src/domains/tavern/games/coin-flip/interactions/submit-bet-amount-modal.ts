import { setTimeout } from 'node:timers/promises';

import type { ModalSubmitInteraction } from 'discord.js';

import { NotFoundError } from '../../../../../discord/errors.js';
import type { ModalHandler } from '../../../../../discord/types.js';
import { assertInteractorIsTheOwner, parseIntegerArg, parseOwnerDiscordId } from '../../../../../discord/utils/index.js';
import { InsufficientFundsError } from '../../../../economy/index.js';
import * as playerRepository from '../../../../player/repository.js';
import { getReachableTavern } from '../../../utils/get-reachable-tavern.js';
import { BET_AMOUNT_FIELD_ID, COIN_FLIP_BET_MODAL_NAME, COIN_FLIP_THROW_ANIMATION, COIN_SIDE_FIELD_ID } from '../constants.js';
import { parseCoinSide, parsePositiveBet } from '../parsers.js';
import * as coinFlipService from '../service.js';
import { buildCoinFlipResultView } from '../views/build-coin-flip-result-view.js';
import { buildCoinFlipThrowingView } from '../views/build-coin-flip-throwing-view.js';

export const submitBetAmountModalHandler: ModalHandler = {
  name: COIN_FLIP_BET_MODAL_NAME,
  handle,
};

async function handle(interaction: ModalSubmitInteraction, args: Array<string>): Promise<void> {
  const ownerDiscordId = parseOwnerDiscordId(args[0]);
  assertInteractorIsTheOwner(interaction, ownerDiscordId);
  const playerId = parseIntegerArg(args[1]);
  const betAmount = parsePositiveBet(interaction.fields.getTextInputValue(BET_AMOUNT_FIELD_ID));
  const chosenSide = parseCoinSide(interaction.fields.getStringSelectValues(COIN_SIDE_FIELD_ID)[0]);

  await interaction.deferUpdate();

  const player = await playerRepository.findByIdOrThrow(playerId);
  if (betAmount > player.berries) throw new InsufficientFundsError();

  const tavernConfig = getReachableTavern(player);
  if (!tavernConfig) throw new NotFoundError('Pas de taverne accessible depuis ta position.');

  const outcome = await coinFlipService.resolveCoinFlip({ playerId, betAmount, chosenSide });

  await interaction.editReply(buildCoinFlipThrowingView());
  await setTimeout(COIN_FLIP_THROW_ANIMATION.durationMs);
  await interaction.editReply(buildCoinFlipResultView({ outcome, tavernKeeper: tavernConfig.tavernKeeper, ownerDiscordId, playerId }));
}
