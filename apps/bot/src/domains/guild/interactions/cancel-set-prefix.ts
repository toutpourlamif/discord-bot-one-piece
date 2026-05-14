import type { ButtonInteraction } from 'discord.js';

import type { ButtonHandler } from '../../../discord/types.js';
import { assertInteractorIsTheOwner, parseOwnerDiscordId } from '../../../discord/utils/index.js';
import { CANCEL_SET_PREFIX_BUTTON_NAME } from '../constants.js';

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const ownerDiscordId = parseOwnerDiscordId(args[0]);
  assertInteractorIsTheOwner(interaction, ownerDiscordId);

  await interaction.deferUpdate();
  await interaction.editReply({ content: 'Annulé.', embeds: [], components: [] });
}

export const cancelSetPrefixButtonHandler: ButtonHandler = {
  name: CANCEL_SET_PREFIX_BUTTON_NAME,
  handle,
};
