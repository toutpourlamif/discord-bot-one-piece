import { ButtonBuilder, ButtonStyle, type ButtonInteraction } from 'discord.js';

import type { ButtonHandler } from '../types.js';

import { assertInteractorIsTheOwner } from './assert-interactor-is-the-owner.js';
import { buildCustomId } from './build-custom-id.js';
import { buildOpEmbed } from './build-op-embed.js';
import { editReply } from './edit-reply.js';
import { parseOwnerDiscordId } from './parse-owner-discord-id.js';

const CANCEL_BUTTON_NAME = 'cancel';
const CANCEL_MESSAGE = 'Aucune modification apportée.';

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
  const embed = buildOpEmbed('default').setDescription(CANCEL_MESSAGE);
  await editReply(interaction, { content: null, embeds: [embed], components: [] });
}

export const cancelButtonHandler: ButtonHandler = {
  name: CANCEL_BUTTON_NAME,
  handle,
};
