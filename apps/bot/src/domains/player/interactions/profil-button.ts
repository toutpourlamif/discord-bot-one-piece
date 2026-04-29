import type { ButtonInteraction } from 'discord.js';

import { ValidationError } from '../../../discord/errors.js';
import type { ButtonHandler } from '../../../discord/types.js';
import { assertMenuOwner } from '../../../discord/utils/assert-menu-owner.js';
import { parseIntegerArg } from '../../../discord/utils/parse-integer-arg.js';
import { PROFIL_BUTTON_NAME } from '../constants.js';
import { buildProfilView } from '../profil-view.js';

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const ownerDiscordId = args[0];
  if (!ownerDiscordId) throw new ValidationError('Propriétaire du menu introuvable.');
  if (!(await assertMenuOwner(interaction, ownerDiscordId))) return;
  const playerId = parseIntegerArg(args[1]);

  await interaction.deferUpdate();
  await interaction.editReply(await buildProfilView(playerId, ownerDiscordId));
}

export const profilButtonHandler: ButtonHandler = {
  name: PROFIL_BUTTON_NAME,
  handle,
};
