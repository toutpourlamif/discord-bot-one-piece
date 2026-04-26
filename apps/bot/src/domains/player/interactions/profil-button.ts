import type { ButtonInteraction } from 'discord.js';

import type { ButtonHandler } from '../../../discord/types.js';
import { parseIntegerArg } from '../../../discord/utils/parse-integer-arg.js';
import { PROFIL_BUTTON_NAME } from '../constants.js';
import { buildProfilView } from '../profil-view.js';

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const playerId = parseIntegerArg(args[0]);

  await interaction.deferUpdate();
  await interaction.editReply(await buildProfilView(playerId));
}

export const profilButtonHandler: ButtonHandler = {
  name: PROFIL_BUTTON_NAME,
  handle,
};
