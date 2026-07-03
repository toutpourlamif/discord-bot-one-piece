import type { ModalSubmitInteraction } from 'discord.js';

import type { ModalHandler } from '../../../../../discord/types.js';
import { assertInteractorIsTheOwner, parseIntegerArg, parseOwnerDiscordId } from '../../../../../discord/utils/index.js';
import { InsufficientFundsError } from '../../../../economy/index.js';
import * as playerRepository from '../../../../player/repository.js';
import { BET_AMOUNT_FIELD_ID, COIN_FLIP_BET_MODAL_NAME } from '../constants.js';
import { parsePositiveBet } from '../parsers.js';
import { buildChooseSideView } from '../views/build-choose-side-view.js';

export const submitBetAmountModalHandler: ModalHandler = {
  name: COIN_FLIP_BET_MODAL_NAME,
  handle,
};

async function handle(interaction: ModalSubmitInteraction, args: Array<string>): Promise<void> {
  const ownerDiscordId = parseOwnerDiscordId(args[0]);
  assertInteractorIsTheOwner(interaction, ownerDiscordId);
  const playerId = parseIntegerArg(args[1]);
  const betAmount = parsePositiveBet(interaction.fields.getTextInputValue(BET_AMOUNT_FIELD_ID));

  await interaction.deferUpdate();

  const player = await playerRepository.findByIdOrThrow(playerId);
  if (betAmount > player.berries) throw new InsufficientFundsError();

  await interaction.editReply(buildChooseSideView({ betAmount, ownerDiscordId, playerId }));
}
