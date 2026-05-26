import type { ButtonInteraction } from 'discord.js';

import { NotFoundError } from '../../../discord/errors.js';
import type { ButtonHandler } from '../../../discord/types.js';
import { assertInteractorIsTheOwner, buildOpEmbed, parseIntegerArg, parseOwnerDiscordId } from '../../../discord/utils/index.js';
import { wipeHistoryForPlayer } from '../../history/index.js';
import * as playerRepository from '../../player/repository.js';
import { CONFIRM_WIPE_HISTORY_BUTTON_NAME } from '../constants.js';
import { buildWipeHistoryMessage } from '../utils/build-wipe-history-message.js';

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const ownerDiscordId = parseOwnerDiscordId(args[0]);
  assertInteractorIsTheOwner(interaction, ownerDiscordId);

  const targetPlayerId = parseIntegerArg(args[1]);
  const kind = args[2];

  await interaction.deferUpdate();

  const actorPlayer = await playerRepository.findByDiscordId(ownerDiscordId);
  if (!actorPlayer) throw new NotFoundError('Joueur introuvable.');

  const targetPlayer = await playerRepository.findByIdOrThrow(targetPlayerId);
  const result = await wipeHistoryForPlayer({
    targetPlayerId: targetPlayer.id,
    actorPlayerId: actorPlayer.id,
    kind,
    mode: 'all',
  });

  await interaction.editReply({
    embeds: [buildOpEmbed('success').setDescription(buildWipeHistoryMessage(targetPlayer.name, kind, 'all', result))],
    components: [],
  });
}

export const confirmWipeHistoryButtonHandler: ButtonHandler = {
  name: CONFIRM_WIPE_HISTORY_BUTTON_NAME,
  handle,
};
