import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type ButtonInteraction } from 'discord.js';

import { PAGINATION } from '../../../discord/constants.js';
import type { ButtonHandler } from '../../../discord/types.js';
import { assertInteractorIsTheOwner, buildConsequenceEmbed, editReply, parseOwnerDiscordId } from '../../../discord/utils/index.js';
import { EVENT_CONSEQUENCE_BUTTON_NAME } from '../constants.js';
import { buildEventNextCustomId } from '../utils/build-event-custom-id.js';

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const ownerDiscordId = parseOwnerDiscordId(args[0]);
  assertInteractorIsTheOwner(interaction, ownerDiscordId);
  await interaction.deferUpdate();

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(buildEventNextCustomId(ownerDiscordId))
      .setEmoji(PAGINATION.next.emoji)
      .setLabel(PAGINATION.next.label)
      .setStyle(ButtonStyle.Primary),
  );
  await editReply(interaction, { embeds: [buildConsequenceEmbed()], components: [row] });
}

export const eventConsequenceButtonHandler: ButtonHandler = {
  name: EVENT_CONSEQUENCE_BUTTON_NAME,
  handle,
};
