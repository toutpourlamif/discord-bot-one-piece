import { setTimeout as sleep } from 'node:timers/promises';

import type { ButtonInteraction } from 'discord.js';

import { NotFoundError } from '../../../../../discord/errors.js';
import type { ButtonHandler } from '../../../../../discord/types.js';
import {
  assertInteractorIsTheOwner,
  editReply,
  parseBigintArg,
  parseIntegerArg,
  parseOwnerDiscordId,
} from '../../../../../discord/utils/index.js';
import * as playerRepository from '../../../../player/repository.js';
import { getReachableTavern } from '../../../utils/get-reachable-tavern.js';
import { COIN_FLIP_PLAY_BUTTON_NAME, COIN_FLIP_THROW_ANIMATION } from '../constants.js';
import { parseCoinSide } from '../parsers.js';
import * as coinFlipService from '../service.js';
import { buildCoinFlipResultView } from '../views/build-coin-flip-result-view.js';
import { buildCoinFlipThrowingView } from '../views/build-coin-flip-throwing-view.js';

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const ownerDiscordId = parseOwnerDiscordId(args[0]);
  assertInteractorIsTheOwner(interaction, ownerDiscordId);
  const playerId = parseIntegerArg(args[1]);
  const betAmount = parseBigintArg(args[2]);
  const chosenSide = parseCoinSide(args[3]);

  await interaction.deferUpdate();
  const player = await playerRepository.findByIdOrThrow(playerId);
  const tavernConfig = getReachableTavern(player);
  if (!tavernConfig) throw new NotFoundError('Pas de taverne accessible depuis ta position.');

  const outcome = await coinFlipService.resolveCoinFlip({ playerId, betAmount, chosenSide });

  await editReply(interaction, buildCoinFlipThrowingView());
  await sleep(COIN_FLIP_THROW_ANIMATION.durationMs);
  await editReply(interaction, buildCoinFlipResultView({ outcome, tavernKeeper: tavernConfig.tavernKeeper, ownerDiscordId, playerId }));
}

export const playCoinFlipButtonHandler: ButtonHandler = {
  name: COIN_FLIP_PLAY_BUTTON_NAME,
  handle,
};
