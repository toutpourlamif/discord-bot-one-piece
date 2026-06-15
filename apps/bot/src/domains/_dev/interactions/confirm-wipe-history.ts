import type { ButtonInteraction } from 'discord.js';

import { ValidationError } from '../../../discord/errors.js';
import type { ButtonHandler } from '../../../discord/types.js';
import { assertInteractorIsTheOwner, buildOpEmbed, editReply, parseIntegerArg, parseOwnerDiscordId } from '../../../discord/utils/index.js';
import * as historyService from '../../history/services/index.js';
import type { WipeHistoryMode } from '../../history/services/index.js';
import * as playerRepository from '../../player/repository.js';
import { CONFIRM_WIPE_HISTORY_BUTTON_NAME } from '../constants.js';
import { buildWipeHistoryMessage } from '../utils/build-wipe-history-message.js';

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const ownerDiscordId = parseOwnerDiscordId(args[0]);
  assertInteractorIsTheOwner(interaction, ownerDiscordId);

  const targetPlayerId = parseIntegerArg(args[1]);
  const mode = parseWipeMode(args[2]);
  const kind = args[3] ?? undefined;

  await interaction.deferUpdate();

  const actorPlayer = await playerRepository.findByDiscordIdOrThrow(ownerDiscordId);
  const targetPlayer = await playerRepository.findByIdOrThrow(targetPlayerId);
  const result = await historyService.wipeHistoryForPlayer({
    targetPlayerId: targetPlayer.id,
    actorPlayerId: actorPlayer.id,
    kind,
    mode,
  });

  await editReply(interaction, {
    embeds: [buildOpEmbed('success').setDescription(buildWipeHistoryMessage(targetPlayer.name, kind, mode, result))],
    components: [],
  });
}

function parseWipeMode(raw: string | undefined): WipeHistoryMode {
  if (raw !== 'last' && raw !== 'all') throw new ValidationError(`Mode wipeHistory invalide: ${raw ?? '(vide)'}`);
  return raw;
}

export const confirmWipeHistoryButtonHandler: ButtonHandler = {
  name: CONFIRM_WIPE_HISTORY_BUTTON_NAME,
  handle,
};
