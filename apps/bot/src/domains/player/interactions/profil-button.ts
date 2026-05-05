import type { ButtonInteraction } from 'discord.js';

import type { ButtonHandler } from '../../../discord/types.js';
import { assertMenuOwner, parseIntegerArg, parseMenuOwnerDiscordId } from '../../../discord/utils/index.js';
import { buildProfilView } from '../build-profil-view.js';
import { PROFIL_BUTTON_NAME } from '../constants.js';

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const ownerDiscordId = parseMenuOwnerDiscordId(args[0]);
  assertMenuOwner(interaction, ownerDiscordId);
  const playerId = parseIntegerArg(args[1]);

  await interaction.deferUpdate();
  await interaction.editReply(await buildProfilView(playerId, ownerDiscordId));
}

export const profilButtonHandler: ButtonHandler = {
  name: PROFIL_BUTTON_NAME,
  handle,
};
