import type { ButtonInteraction } from 'discord.js';

import type { ButtonHandler } from '../../../discord/types.js';
import { assertInteractorIsTheOwner, parseOwnerDiscordId } from '../../../discord/utils/index.js';
import { TAVERN_SECTION_BUTTON_NAME } from '../constants.js';

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const ownerDiscordId = parseOwnerDiscordId(args[0]);
  assertInteractorIsTheOwner(interaction, ownerDiscordId);

  await interaction.reply({ content: '🔜 Bientôt disponible', ephemeral: true });
}

export const tavernSectionButtonHandler: ButtonHandler = {
  name: TAVERN_SECTION_BUTTON_NAME,
  handle,
};
