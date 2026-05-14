import type { ButtonInteraction } from 'discord.js';

import { NotFoundError } from '../../../discord/errors.js';
import type { ButtonHandler } from '../../../discord/types.js';
import { assertInteractorIsTheOwner, parseOwnerDiscordId } from '../../../discord/utils/index.js';
import * as playerRepository from '../../player/repository.js';
import { buildRecapView } from '../recap/build-recap-view.js';

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const ownerDiscordId = parseOwnerDiscordId(args[0]);
  assertInteractorIsTheOwner(interaction, ownerDiscordId);
  await interaction.deferUpdate();

  const player = await playerRepository.findByDiscordId(ownerDiscordId);
  if (!player) throw new NotFoundError('Joueur introuvable.');

  await interaction.editReply(await buildRecapView(player));
}

export const recapShortcutButtonHandler: ButtonHandler = {
  name: 'recap-shortcut',
  handle,
};
