import type { ButtonInteraction } from 'discord.js';

import type { ButtonHandler } from '../../../discord/types.js';
import { PROFIL_BUTTON_NAME } from '../constants.js';
import { buildProfilView } from '../profil-view.js';

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const playerId = Number(args[0]);
  // TODO: AJOUTER UTIL qui valide les les players
  if (!Number.isInteger(playerId)) {
    throw new Error(`arguments invalides dans profil button: ${interaction.customId}`);
  }
  await interaction.deferUpdate();
  await interaction.editReply(await buildProfilView(playerId));
}

export const profilButtonHandler: ButtonHandler = {
  name: PROFIL_BUTTON_NAME,
  handle,
};
