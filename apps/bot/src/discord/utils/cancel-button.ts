import { ButtonBuilder, ButtonStyle, type ButtonInteraction } from 'discord.js';

import type { ButtonHandler } from '../types.js';

import { assertInteractorIsTheOwner } from './assert-interactor-is-the-owner.js';
import { buildCustomId } from './build-custom-id.js';
import { parseOwnerDiscordId } from './parse-owner-discord-id.js';

const CANCEL_BUTTON_NAME = 'cancel';

export function buildCancelButton(ownerDiscordId: string): ButtonBuilder {
  return new ButtonBuilder()
    .setCustomId(buildCustomId(CANCEL_BUTTON_NAME, ownerDiscordId))
    .setLabel('Annuler')
    .setStyle(ButtonStyle.Secondary);
}

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const ownerDiscordId = parseOwnerDiscordId(args[0]);
  assertInteractorIsTheOwner(interaction, ownerDiscordId);
  await interaction.deferUpdate();
  await interaction.editReply({ content: 'Annulé.', embeds: [], components: [] });
}

export const cancelButtonHandler: ButtonHandler = {
  name: CANCEL_BUTTON_NAME,
  handle,
};
