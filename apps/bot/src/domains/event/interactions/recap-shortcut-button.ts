import type { ButtonInteraction } from 'discord.js';

import type { ButtonHandler } from '../../../discord/types.js';
import { assertInteractorIsTheOwner, parseOwnerDiscordId } from '../../../discord/utils/index.js';

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const ownerDiscordId = parseOwnerDiscordId(args[0]);
  assertInteractorIsTheOwner(interaction, ownerDiscordId);

  // TODO: brancher sur la fonction partagée avec la commande !recap
  await interaction.reply({ content: 'TODO: brancher sur la commande !recap', ephemeral: true });
}

export const recapShortcutButtonHandler: ButtonHandler = {
  name: 'recap-shortcut',
  handle,
};
